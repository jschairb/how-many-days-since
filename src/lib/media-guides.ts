import mediaGuideData from '../data/media-guides.json';
import type { TeamId } from './rivalry-snapshot';

/** One program's media guide for one season, as scanned by the Internet Archive. */
export interface MediaGuide {
  teamId: TeamId;
  season: number;
  /** The Internet Archive item identifier the reader and the item page hang off. */
  identifier: string;
  title: string;
}

export const mediaGuides = mediaGuideData.guides as readonly MediaGuide[];

export const mediaGuideFor = (teamId: TeamId, season: number): MediaGuide | undefined =>
  mediaGuides.find((guide) => guide.teamId === teamId && guide.season === season);

/**
 * The Internet Archive's own reader. Embedding through it leaves the scan on
 * their infrastructure — these are uploads of program publications, and the
 * site links and frames them rather than re-hosting the files.
 */
export const mediaGuideEmbedUrl = (guide: MediaGuide) => `https://archive.org/embed/${guide.identifier}`;
export const mediaGuideItemUrl = (guide: MediaGuide) => `https://archive.org/details/${guide.identifier}`;
