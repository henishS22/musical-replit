import { Injectable } from '@nestjs/common';
import { QuestService } from '../quest/quest.service';
import { EmailDTO, InstaConnectDTO, PostDTO, ProfileConnectDTO, TextDTO } from './dto/scrapper.dto';
import { resourceDuplicateError, resourceError, resourceNotFoundError, resourceOTPError } from './utils/errors';
import { InjectModel } from '@nestjs/mongoose';
import { CreatorQuest, CreatorQuestDocument } from '../schemas/schemas/creatorQuest';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/schemas';
import { chromium, Page, BrowserContext } from 'playwright';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapingBeeClient } from 'scrapingbee';

@Injectable()
export class ScrapperService {
    constructor(
        private questService: QuestService,
        @InjectModel(CreatorQuest.name) private readonly creatorQuestModel: Model<CreatorQuestDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    // new caption match functions
    async matchCaption(bodyCaption: string, extractedCaption: string) {
        const normalize = (text) => text.replace(/[^\w\s]/g, '').trim().toLowerCase();

        const a = normalize(bodyCaption);
        const b = normalize(extractedCaption);

        const matrix = Array.from({ length: a.length + 1 }, () =>
            Array(b.length + 1).fill(0)
        );

        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }

        const distance = matrix[a.length][b.length];
        const maxLen = Math.max(a.length, b.length);
        const similarity = maxLen === 0 ? 1 : (1 - distance / maxLen);

        return similarity >= 0.7;
    }

    //captions match
    async matchCaptions(bodyCaption: string, extractedCaption: string) {
        const normalize = (text: string) => {
            return text
                .replace(/[^\w\s]/g, '')
                .trim()
                .toLowerCase();
        };

        return normalize(bodyCaption) === normalize(extractedCaption);
    }

    //hashtags match
    async matchHashtags(bodyHashtags: string[], extractedHashtags: string[]): Promise<boolean> {
        if (bodyHashtags.length !== extractedHashtags.length) return false;

        const normalize = (arr: string[]) =>
            arr.map(tag => tag.toLowerCase()).sort();

        const bodySorted = normalize(bodyHashtags);
        const extractedSorted = normalize(extractedHashtags);

        return bodySorted.every((tag, index) => tag === extractedSorted[index]);
    }

    //mentions match
    async matchMentions(bodyMentions: string[], extractedMentions: string[]): Promise<boolean> {
        if (bodyMentions.length !== extractedMentions.length) return false;

        const normalize = (arr: string[]) =>
            arr.map(m => m.toLowerCase()).sort();

        const bodySorted = normalize(bodyMentions);
        const extractedSorted = normalize(extractedMentions);

        return bodySorted.every((mention, index) => mention === extractedSorted[index]);
    }

    //Instagram
    async checkInstagramProfileExists(dto: InstaConnectDTO, owner: string): Promise<any> {
        const { url, questId, post } = dto;

        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })

        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        });

        const page: Page = await context.newPage();

        try {
            await page.goto(post, { waitUntil: 'domcontentloaded', timeout: 70000 });
        } catch (error) {
            return resourceNotFoundError("Profile")
        }

        const pageContent = await page.content();
        let metaDescMatch
        metaDescMatch = pageContent.match(/<meta name="description" content="([^"]+)"\/?>/);

        let rawMetaText = '';

        if (metaDescMatch && metaDescMatch[1]) {
            rawMetaText = metaDescMatch[1].replace(/&quot;/g, '"').trim();
        }

        if (rawMetaText === '') {
            console.log('into scrapping bee ---->>>>>>>>>>>>>>>');
            const html = await this.scrapperBee(post)
            metaDescMatch = html.match(/<meta name="description" content="([^"]+)"\/?>/);
            rawMetaText = metaDescMatch[1].replace(/&quot;/g, '"').trim();
        }


        const regex = /^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)/i;
        const match = url.match(regex);
        const username = match ? match[2] : null;

        const profileExists = rawMetaText.includes(username);

        await browser.close();
        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        return resourceNotFoundError("Profile")
    }

    // Facebook
    async checkFacebookProfileExists(dto: ProfileConnectDTO, owner: string): Promise<any> {
        const { url, questId, } = dto;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            },
        });

        const $ = cheerio.load(response.data);
        const title = $('title').text();
        console.log(title, '-------------------------');

        const profileExists =
            title &&
            !title.toLowerCase().includes('facebook') &&
            !title.toLowerCase().includes('log into') &&
            title.length > 0;

        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        return resourceNotFoundError("Profile")
    }

    //twitter
    async checkXProfileExists(dto: ProfileConnectDTO, owner: string): Promise<any> {
        const { url, questId, } = dto;


        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 70000 });
        } catch (error) {
            return resourceNotFoundError("Profile")
        }
        await page.waitForTimeout(4500)

        const title = await page.title()
        const titleIndicators = ['Profile / X', 'Page not found / X'];
        const profileExists = !titleIndicators.some(indicator => title.includes(indicator));

        console.log(title, '----title----')
        console.log(profileExists, '----profileExists------');

        await browser.close();

        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        await browser.close();
        return resourceNotFoundError("Profile")
    }

    //tiktok
    async checkTiktokProfileExists(dto: ProfileConnectDTO, owner: string): Promise<any> {
        const { url, questId, } = dto;
        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })

        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117 Safari/537.36',
        });

        const page: Page = await context.newPage();

        let profileExists = false;
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 50000 });
        } catch (error) {
            profileExists = false
            return resourceNotFoundError("Profile")
        }

        const usernameExists = await page.$('h1[data-e2e="user-title"]');

        if (usernameExists) {
            profileExists = true;
        }

        console.log(profileExists, '-------profileExists--------------');

        await browser.close();

        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null
                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        return resourceNotFoundError("Profile")
    }

    //email
    async checkEmail(dto: EmailDTO, owner: string): Promise<any> {
        const { email, questId, } = dto;

        const user = await this.userModel.findById(owner).select("email").exec();
        const profileExists = user && user.email === email ? true : false

        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null
                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        return resourceNotFoundError("Profile")
    }

    //text
    async checkText(dto: TextDTO, owner: string): Promise<any> {
        const { mobile, countryCode, code, questId, } = dto;
        const user = await this.userModel.findById(owner).select("mobile countryCode otp").exec();
        let profileExists = false

        if (user && user.mobile === mobile && user.countryCode === countryCode && user.otp?.code === code && new Date() < new Date(user.otp?.expireIn)) {
            profileExists = true
            user.otp = undefined
            await user.save()
        }

        if (profileExists) {
            const isPublishByAdmin = true
            const creatorQuestId = null
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null
                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        }
        return resourceOTPError()
    }

    //hashtags,mentions and captions
    async instagramPostAnalysis(dto: PostDTO, owner: string): Promise<any> {
        const { url, creatorQuestId } = dto;

        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })

        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        });

        const page: Page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 70000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        let metaDescMatch
        const pageContent = await page.content();

        metaDescMatch = pageContent.match(/<meta name="description" content="([^"]+)"\/?>/);
        let rawMetaText = '';

        if (metaDescMatch && metaDescMatch[1]) {
            rawMetaText = metaDescMatch[1].replace(/&quot;/g, '"').trim();
        }

        if (rawMetaText === '') {
            console.log('into scrapping bee ---->>>>>>>>>>>>>>>');
            const html = await this.scrapperBee(url)
            metaDescMatch = html.match(/<meta name="description" content="([^"]+)"\/?>/);
            rawMetaText = metaDescMatch[1].replace(/&quot;/g, '"').trim();
        }

        console.log(rawMetaText, '------------rawMetaText----------------');

        const lines = rawMetaText.split('\n').map(line => line.trim()).filter(line => line);
        console.log(lines, '------------lines----------------');

        const hashtags = [];
        const mentions = [];
        const captionLines = [];

        for (const line of lines) {
            const tagMatches = line.match(/#\w+/g);
            const mentionMatches = line.match(/@\w+/g);

            if (tagMatches) hashtags.push(...tagMatches);
            if (mentionMatches) mentions.push(...mentionMatches);

            // Extract caption regardless of presence of @ or #
            const captionPart = line
                .replace(/^[^:]*:\s*/, '')       // Remove prefix before caption
                .replace(/^"+|"+$/g, '')         // Strip surrounding quotes
                .replace(/[@#]\w+/g, '')         // Remove @mentions and #hashtags
                .replace(/[."]+$/, '')           // Remove trailing .' or ." etc.
                .trim();

            if (captionPart) captionLines.push(captionPart);
        }

        const caption = captionLines.join(' ').trim();

        console.log('Caption:', caption);
        console.log('Hashtags:', hashtags);
        console.log('Mentions:', mentions);

        await browser.close();

        const creatorQuest = await this.creatorQuestModel.findOne({
            _id: creatorQuestId,
            isPublished: true,
            userId: { $ne: owner }
        });

        if (!creatorQuest) {
            return resourceNotFoundError("Mission")
        }
        const captionsMatch = await this.matchCaptions(creatorQuest.metaData.caption, caption);
        const hashtagsMatch = await this.matchHashtags(creatorQuest.metaData.hashtags, hashtags);
        const mentionsMatch = await this.matchMentions(creatorQuest.metaData.mentions, mentions);

        console.log(creatorQuest, '------------creatorQuest---------------');
        console.log(captionsMatch, '-------------captionsMatch--------------');
        console.log(hashtagsMatch, '------------hashtagsMatch---------------');
        console.log(mentionsMatch, '------------mentionsMatch---------------');

        if (hashtagsMatch && captionsMatch && mentionsMatch) {
            const isPublishByAdmin = false
            const questId = creatorQuest.questId.toString()
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        } else {
            return resourceError("Post")
        }
    }

    //hashtags,mentions and captions
    async facebookPostAnalysis(dto: PostDTO, owner: string) {
        const { url, creatorQuestId } = dto;

        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
        });
        const page: Page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 58000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        // Wait for the post container to load
        try {
            await page.waitForSelector('[data-ad-preview="message"], div[dir="auto"]', { timeout: 58000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
            const seeMoreButton = buttons.find(btn => (btn as HTMLElement).innerText.trim() === 'See more');
            if (seeMoreButton) {
                (seeMoreButton as HTMLElement).click();
            }
        });

        await new Promise(resolve => setTimeout(resolve, 10000))


        // Extract post information using Puppeteer's page.evaluate
        const result = await page.evaluate(() => {
            let caption = '';
            let hashtags: any = [];
            let mentions: any = [];

            const postContainer: HTMLElement | null = document.querySelector('[data-ad-preview="message"]') || document.querySelector('div[dir="auto"]');

            if (postContainer) {
                const text = postContainer.innerText || '';
                caption = text.replace(/#[\w]+/g, '').replace(/@\w+/g, '').trim();
                // caption = text
                hashtags = (text.match(/#[\w]+/g) || []).map(tag => tag.trim());

                // Extract mentions from Facebook links
                const mentionLinks = postContainer.querySelectorAll<HTMLAnchorElement>('a[href*="facebook.com/"]:not([data-ad-rendering-role="profile_name"])');
                mentionLinks.forEach(link => {
                    const href = link.getAttribute('href') || '';
                    const name = link.innerText.trim();

                    if (
                        href &&
                        href.includes('facebook.com/') &&
                        !href.includes('login') &&
                        !href.includes('recover') &&
                        !href.includes('hashtag') &&
                        !href.includes('permalink.php') &&
                        !href.includes('__tn__=-]C%2CP-R')
                    ) {
                        const match = href.match(/facebook\.com\/([^?&/]+)/);
                        if (match && match[1]) {
                            mentions.push(name);
                        }
                    }
                });
            }

            return { caption, hashtags, mentions };
        });
        // Close the browser
        await browser.close();

        // Assign the result from evaluate to the variables
        const { caption, hashtags, mentions } = result;

        // Log the extracted values
        console.log(caption, '------------caption---------------');
        console.log(hashtags, '------------hashtags---------------');
        console.log(mentions, '------------mentions---------------');

        // Fetch the creator quest from the database
        const creatorQuest = await this.creatorQuestModel.findOne({
            _id: creatorQuestId,
            isPublished: true,
            userId: { $ne: owner }
        });
        if (!creatorQuest) {
            return resourceNotFoundError("Mission");
        }

        // Match the extracted data with the creator quest's metadata
        const captionsMatch = await this.matchCaptions(creatorQuest.metaData.caption, caption);
        const hashtagsMatch = await this.matchHashtags(creatorQuest.metaData.hashtags, hashtags);
        const mentionsMatch = await this.matchMentions(creatorQuest.metaData.mentions, mentions);

        // Log the match results
        console.log(creatorQuest, '------------creatorQuest---------------');
        console.log(captionsMatch, '--------------captionsMatch-------------');
        console.log(hashtagsMatch, '------------hashtagsMatch---------------');
        console.log(mentionsMatch, '------------mentionsMatch---------------');

        // If all match conditions are satisfied, create the quest history and return success response
        if (hashtagsMatch && captionsMatch && mentionsMatch) {
            const isPublishByAdmin = false;
            const questId = creatorQuest.questId.toString();
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner);

            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        } else {
            return resourceError("Post");
        }
    }

    //hashtags,mentions and captions
    async xPostAnalysis(dto: PostDTO, owner: string) {
        const { url, creatorQuestId } = dto;

        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })
        const context: BrowserContext = await browser.newContext();
        const page: Page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 59000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        try {
            await page.waitForSelector('article', { timeout: 50000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        const texts = await page.evaluate(() => {
            const tweetArticle: any = document.querySelector('article');
            if (!tweetArticle) null
            const tweetTextBlock: any = tweetArticle.querySelectorAll('div[lang]');
            if (tweetTextBlock && tweetTextBlock.length > 0) {
                return Array.from(tweetTextBlock).map((div: any) => div.innerText).join(" ").trim()
            }
            return null
        });
        console.log(texts, '------------texts---------------');

        await browser.close();

        const hashtags = texts.match(/#[\w]+/g) || [];
        const mentions = texts.match(/@[\w.]+/g) || [];

        const caption = texts
            .split(/\n/)
            .map(line => line
                .replace(/#[\w]+/g, '')
                .replace(/@[\w.]+/g, '')
                .trim()
            )
            .filter(line => line.length > 0)
            .join(' ')
            .replace(/\(.*?\)/g, '')
            .trim();

        console.log(caption, '------------caption---------------');
        console.log(hashtags, '------------hashtags---------------');
        console.log(mentions, '------------mentions---------------');

        const creatorQuest = await this.creatorQuestModel.findOne({
            _id: creatorQuestId,
            isPublished: true,
            userId: { $ne: owner }
        });

        if (!creatorQuest) {
            return resourceNotFoundError("Mission")
        }
        const captionsMatch = await this.matchCaptions(creatorQuest.metaData.caption, caption);
        const hashtagsMatch = await this.matchHashtags(creatorQuest.metaData.hashtags, hashtags);
        const mentionsMatch = await this.matchMentions(creatorQuest.metaData.mentions, mentions);


        console.log(creatorQuest, '------------creatorQuest---------------');
        console.log(captionsMatch, '--------------captionsMatch-------------');
        console.log(hashtagsMatch, '------------hashtagsMatch---------------');
        console.log(mentionsMatch, '------------mentionsMatch---------------');

        if (hashtagsMatch && captionsMatch && mentionsMatch) {
            const isPublishByAdmin = false
            const questId = creatorQuest.questId.toString()
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null

                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        } else {
            return resourceError("Post")
        }
    }

    //hashtags,mentions and captions
    async tiktokPostAnalysis(dto: PostDTO, owner: string) {
        const { url, creatorQuestId } = dto;

        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
            ],
        })
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117 Safari/537.36',
        });

        const page: Page = await context.newPage();
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 50000 });
        } catch (error) {
            return resourceNotFoundError("Post")
        }

        const selectors = [
            'div[data-e2e="browse-video-desc"]',
            'div[class*="Desc"]',
            'div[class*="VideoDescription"]',
        ];

        let caption = ''
        let hashtags = [];
        let mentions = [];
        for (const selector of selectors) {

            try {
                await page.waitForSelector(selector, { timeout: 50000 });
            } catch (error) {
                return resourceNotFoundError("Post")
            }

            const texts = await page.$eval(selector, el => el.textContent?.trim() || '');
            console.log(texts, '-------------------texts');

            if (texts) {
                caption = texts
                    .replace(/^.*?·\s*\d+\w?\s+ago\s+Followmore/i, '')
                    .replace(/#\w+/g, '')
                    .replace(/@\w+/g, '')
                    .replace(/original sound.*$/i, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                hashtags = texts.match(/#\w+/g) || [];
                mentions = texts.match(/@\w+/g) || [];
                break;
            }
        }

        await browser.close();

        console.log(caption, '-----------------------caption');
        console.log(hashtags, '-----------------------hashtags');
        console.log(mentions, '------------------------mentions');

        const creatorQuest = await this.creatorQuestModel.findOne({
            _id: creatorQuestId,
            isPublished: true,
            userId: { $ne: owner }
        });

        if (!creatorQuest) {
            return resourceNotFoundError("Mission")
        }
        const matchPercentage = await this.matchCaption(creatorQuest.metaData.caption, caption)
        console.log(matchPercentage, '-----------matchPercentage--------------');

        const captionsMatch = await this.matchCaptions(creatorQuest.metaData.caption, caption);
        const hashtagsMatch = await this.matchHashtags(creatorQuest.metaData.hashtags, hashtags);
        const mentionsMatch = await this.matchMentions(creatorQuest.metaData.mentions, mentions);


        console.log(creatorQuest, '------------creatorQuest---------------');
        console.log(captionsMatch, '--------------captionsMatch-------------');
        console.log(hashtagsMatch, '------------hashtagsMatch---------------');
        console.log(mentionsMatch, '------------mentionsMatch---------------');

        if (hashtagsMatch && captionsMatch && mentionsMatch) {
            const isPublishByAdmin = false
            const questId = creatorQuest.questId.toString()
            const questData = await this.questService.createQuestHistory(isPublishByAdmin, questId, creatorQuestId, owner)
            if (questData.success) {
                const res = {
                    status: "success",
                    message: "Mission completed successfully.",
                    data: questData?.quest || null
                }
                return res
            } else {
                console.warn("questData is falsy");
                return resourceDuplicateError()
            }
        } else {
            return resourceError("Post")
        }
    }


    //scrapper bee function for data scrapping.
    async scrapperBee(url: string) {
        const client = new ScrapingBeeClient('350K9501OGUSTW3UG98TPM2FCTHDLQT780NT2YAQC6RZI7G7CYQXI7ISG1LRALCXYUSN8NM7PXBAQSP1');
        const response = await client.get({ url, params: {} });
        const decoder = new TextDecoder();
        const html = decoder.decode(response.data);

        return html
    }

}