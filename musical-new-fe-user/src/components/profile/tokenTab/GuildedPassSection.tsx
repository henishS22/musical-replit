import React, { useRef, useState } from "react"
import NFTCard from "./NftCard"
import { Button } from "@nextui-org/react"
import { NoDataFound } from "@/components/ui"
import { Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import { LEFT_ARROW, RIGHT_ARROW } from "@/assets"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface GuildedPassSectionProps {
  passes?: any[]
  loading?: boolean
}

const GuildedPassSection: React.FC<GuildedPassSectionProps> = ({ passes, loading }) => {
  const [swiper, setSwiper] = useState<any>(null)
  const [navigationState, setNavigationState] = useState({
    isBeginning: true,
    isEnd: false
  })
  const navigationPrevRef = useRef<HTMLButtonElement>(null)
  const navigationNextRef = useRef<HTMLButtonElement>(null)
  const router = useRouter();

  const updateNavigationState = () => {
    if (swiper) {
      setNavigationState({
        isBeginning: swiper.isBeginning,
        isEnd: swiper.isEnd
      })
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap gap-5 justify-between items-center w-full mb-5">
        <div className="text-xl font-bold tracking-normal leading-tight text-textPrimary">
          Owned Guilded Passes
        </div>
        {passes && passes.length > 1 && (
          <div className="flex gap-3 items-center">
            <button
              ref={navigationPrevRef}
              className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${navigationState.isBeginning ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              aria-label="Previous slide"
              disabled={navigationState.isBeginning}
            >
              <Image loading="lazy" src={LEFT_ARROW} className="object-contain w-6 h-6" alt="Previous" width={24} height={24} />
            </button>
            <button
              ref={navigationNextRef}
              className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${navigationState.isEnd ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              aria-label="Next slide"
              disabled={navigationState.isEnd}
            >
              <Image loading="lazy" src={RIGHT_ARROW} className="object-contain w-6 h-6" alt="Next" width={24} height={24} />
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="d-flex flex-wrap w-full gap-3 md:gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2 w-full">
              <div className="rounded-lg w-full h-[200px] bg-default-300 animate-pulse"></div>
              <div className="space-y-3">
                <div className="w-3/5 rounded-lg h-3 bg-default-300 animate-pulse"></div>
                <div className="w-4/5 rounded-lg h-3 bg-default-300 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : passes && passes.length > 0 ? (
        <div className="w-full">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current
            }}
            onSwiper={(swiperInstance) => {
              setSwiper(swiperInstance)
              setTimeout(() => {
                updateNavigationState()
              }, 0)
            }}
            onSlideChange={() => {
              updateNavigationState()
            }}
            onReachBeginning={() => {
              setNavigationState((prev) => ({ ...prev, isBeginning: true }))
            }}
            onReachEnd={() => {
              setNavigationState((prev) => ({ ...prev, isEnd: true }))
            }}
            spaceBetween={22}
            slidesPerView={"auto"}
            breakpoints={{
              320: { slidesPerView: "auto", spaceBetween: 10 },
              640: { slidesPerView: "auto", spaceBetween: 15 },
              768: { slidesPerView: "auto", spaceBetween: 20 },
              1024: { slidesPerView: "auto", spaceBetween: 22 }
            }}
            className="nft-swiper"
          >
            {passes.map((nft) => (
              <SwiperSlide
                key={nft._id}
                className="h-auto"
                style={{ width: "auto", minWidth: "244px", maxWidth: "300px" }}
              >
                <div className="p-1">
                  <div onClick={() => router.push(`/guilded-nft-details/${nft._id}`)}>
                    <NFTCard
                      redirectPath={undefined}
                      artworkUrl={nft?.artworkUrl || ""}
                      title={nft?.title || ""}
                      artist={nft?.seller?.name || ""}
                      id={nft?._id || ""}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <NoDataFound message="No Guilded Passes found" />
      )}
    </div>
  )
}

export default GuildedPassSection 