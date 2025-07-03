'use client'
import { useParams, useRouter } from "next/navigation"
import { useUserStore } from "@/stores"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { PROFILE_IMAGE, POLYGONSCAN_LOGO } from "@/assets"

const POLYGONSCAN_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "https://polygonscan.com/tx/"

export default function GuildedNftDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { userData } = useUserStore()
  // Get owned guilded passes from react-query cache
  const { data: ownedGuildedPasses } = useQuery({
    queryKey: ["ownedGuildedPasses"],
    enabled: !!userData?._id
  })

  // If not logged in, redirect
  if (!userData?._id) {
    if (typeof window !== "undefined") router.replace("/profile")
    return null
  }

  // Find the NFT in the owned passes
  let nft = undefined;
  if (ownedGuildedPasses && typeof ownedGuildedPasses === 'object' && Array.isArray((ownedGuildedPasses as any).data)) {
    nft = (ownedGuildedPasses as any).data.find((n: any) => n._id === id);
  }

  // If not found, redirect
  if (!nft) {
    if (typeof window !== "undefined") router.replace("/profile")
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div className="fixed inset-0 z-0">
        <Image
          src={nft?.artworkUrl}
          alt="NFT Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 backdrop-blur-xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex gap-10">
              <div className="w-[466px] h-[472px] relative">
                <Image
                  src={nft?.artworkUrl || PROFILE_IMAGE}
                  alt="NFT"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex-1 flex flex-col gap-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative">
                      <Image
                        src={nft?.user?.profile_img || PROFILE_IMAGE}
                        alt="Creator"
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <span className="font-medium">{nft?.user?.name}</span>
                  </div>
                  <h1 className="font-semibold text-[32px] leading-[40px] tracking-[-0.03em] text-textPrimary">
                    {nft?.title}
                  </h1>
                  <p className="font-medium text-[20px] leading-[32px] tracking-[-0.02em] text-[#6F767E]">
                    {nft?.description}
                  </p>
                </div>
                <div>
                  {nft?.priceInUsd && (
                    <div className="font-semibold text-[32px] leading-[40px] tracking-[-0.03em] mb-4">
                      $ {nft.priceInUsd.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 w-full items-start mt-4">
                  {nft?.transactionHash && (
                    <a
                      href={`${POLYGONSCAN_URL}${nft?.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-waveformBlue font-semibold underline flex items-center gap-2"
                    >
                      <Image src={POLYGONSCAN_LOGO} alt="Polygonscan" width={24} height={24} />
                      View this token on Polygonscan
                    </a>
                  )}
                  {nft?.purchaseTxnHash && (
                    <a
                      href={`${POLYGONSCAN_URL}${nft?.purchaseTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-waveformBlue font-semibold underline flex items-center gap-2"
                    >
                      <Image src={POLYGONSCAN_LOGO} alt="Polygonscan" width={24} height={24} />
                      View your purchase on Polygonscan
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 