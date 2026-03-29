'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { SocialFeedItem } from '@/lib/social';
import { withSocialImageProxy } from '@/lib/url';

interface LoopFeedItem extends SocialFeedItem {
  loopKey: string;
}

function normalizeItems(items: SocialFeedItem[] | null | undefined) {
  return Array.isArray(items) ? items : [];
}

function buildLoopItems(items: SocialFeedItem[] | null | undefined, minimumCount = 8) {
  const normalizedItems = normalizeItems(items);
  if (normalizedItems.length === 0) return [];

  const loopItems: LoopFeedItem[] = [];
  const cycles = Math.max(2, Math.ceil(minimumCount / normalizedItems.length));

  for (let cycle = 0; cycle < cycles; cycle += 1) {
    normalizedItems.forEach((item) => {
      loopItems.push({
        ...item,
        loopKey: `${item.id}-${cycle}`,
      });
    });
  }

  return loopItems;
}

function SocialTile({ item }: { item: LoopFeedItem }) {
  const imageUrl = withSocialImageProxy(item.thumbnail_url || item.media_url);
  const tileClass =
    item.platform === 'tiktok'
      ? 'w-[190px] sm:w-[220px] lg:w-[240px]'
      : 'w-[190px] sm:w-[220px] lg:w-[240px]';
  const ratioClass =
    item.platform === 'tiktok'
      ? 'aspect-[9/16]'
      : item.media_type === 'video'
        ? 'aspect-[4/5]'
        : 'aspect-[4/5]';

  return (
    <Link
      href={item.permalink || '#'}
      target="_blank"
      rel="noreferrer"
      className={`group block shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-200 transition duration-300 hover:-translate-y-1 ${tileClass}`}
      aria-label="Open social post"
    >
      <div className={`relative bg-slate-100 ${ratioClass}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No Media</div>
        )}
      </div>
    </Link>
  );
}

function SocialRow({
  items,
  direction,
  duration,
}: {
  items: LoopFeedItem[];
  direction: 'left' | 'right';
  duration: string;
}) {
  if (items.length === 0) return null;

  const trackClass =
    direction === 'left' ? 'social-marquee-track social-marquee-left' : 'social-marquee-track social-marquee-right';
  const style = { '--social-duration': duration } as CSSProperties;

  return (
    <div className="social-marquee-mask">
      <div className={trackClass} style={style}>
        {[0, 1].map((copyIndex) => (
          <div key={`${direction}-${copyIndex}`} className="flex w-max shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
            {items.map((item) => (
              <SocialTile key={`${item.loopKey}-${copyIndex}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformWall({
  title,
  items,
  shellClass,
}: {
  title: string;
  items: SocialFeedItem[] | null | undefined;
  shellClass: string;
}) {
  const normalizedItems = normalizeItems(items);
  const rowItems = buildLoopItems(items);

  return (
    <article className={`overflow-hidden rounded-[2rem] border border-white/60 ${shellClass}`}>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <h3 className="text-base font-semibold uppercase tracking-[0.28em] text-slate-500">{title}</h3>
      </div>

      {normalizedItems.length > 0 ? (
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
          <SocialRow items={rowItems} direction="left" duration="34s" />
        </div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center px-8 py-10 text-center text-sm text-slate-500">
          No synced posts yet.
        </div>
      )}
    </article>
  );
}

export default function SocialShowcase({
  instagramItems,
  tiktokItems,
}: {
  instagramItems: SocialFeedItem[] | null | undefined;
  tiktokItems: SocialFeedItem[] | null | undefined;
}) {
  return (
    <div className="space-y-6">
      <PlatformWall
        title="Instagram"
        items={instagramItems}
        shellClass="bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,244,249,0.92)_100%)] shadow-[0_30px_70px_-38px_rgba(221,42,123,0.32)]"
      />
      <PlatformWall
        title="TikTok"
        items={tiktokItems}
        shellClass="bg-[linear-gradient(180deg,rgba(248,251,255,0.96)_0%,rgba(239,247,255,0.96)_100%)] shadow-[0_30px_70px_-38px_rgba(15,23,42,0.28)]"
      />
    </div>
  );
}
