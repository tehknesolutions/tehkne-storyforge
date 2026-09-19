import type { MediaTarget } from "../tnir/types.js";

export type ReadingDirection =
  | "LEFT_TO_RIGHT"
  | "RIGHT_TO_LEFT"
  | "VERTICAL_SCROLL"
  | "NOT_APPLICABLE";

export interface MediaProfile {
  id: string;
  target: MediaTarget;
  family: "LITERATURE" | "SEQUENTIAL_ART" | "AUDIOVISUAL" | "INTERACTIVE" | "AUDIO";
  readingDirection?: ReadingDirection;
  hierarchy: string[];
  nativeUnits: string[];
  pacingModel: string[];
  visualGrammar?: string[];
  productionStages?: string[];
  requiredCompilerCapabilities: string[];
}

export const MEDIA_PROFILES: Record<string, MediaProfile> = {
  manga: {
    id: "media-profile:manga:v0.1",
    target: "MANGA",
    family: "SEQUENTIAL_ART",
    readingDirection: "RIGHT_TO_LEFT",
    hierarchy: ["VOLUME", "CHAPTER", "PAGE", "PANEL"],
    nativeUnits: ["PAGE", "PANEL", "DOUBLE_PAGE_SPREAD"],
    pacingModel: ["page_turn", "panel_density", "silent_beats", "chapter_hook"],
    visualGrammar: [
      "screentone",
      "speed_lines",
      "impact_panel",
      "reaction_panel",
      "chibi_mode",
      "silent_panel",
      "double_page_spread"
    ],
    productionStages: ["name", "storyboard", "pencils", "inks", "tones", "lettering"],
    requiredCompilerCapabilities: [
      "right_to_left_layout",
      "page_turn_reveal",
      "panel_rhythm",
      "chapter_serialization"
    ]
  },

  webtoon: {
    id: "media-profile:webtoon:v0.1",
    target: "WEBTOON",
    family: "SEQUENTIAL_ART",
    readingDirection: "VERTICAL_SCROLL",
    hierarchy: ["SEASON", "EPISODE", "SCROLL_SEQUENCE", "PANEL"],
    nativeUnits: ["PANEL", "SCROLL_GAP", "VERTICAL_REVEAL"],
    pacingModel: ["scroll_distance", "vertical_reveal", "episode_hook", "mobile_attention"],
    visualGrammar: [
      "vertical_composition",
      "long_gap",
      "staggered_reveal",
      "mobile_closeup",
      "scroll_transition"
    ],
    productionStages: ["episode_script", "thumbnail", "lineart", "color", "lettering", "scroll_layout"],
    requiredCompilerCapabilities: [
      "vertical_scroll_layout",
      "scroll_based_timing",
      "mobile_first_composition",
      "episode_serialization"
    ]
  },

  manhwa: {
    id: "media-profile:manhwa:v0.1",
    target: "MANHWA",
    family: "SEQUENTIAL_ART",
    readingDirection: "LEFT_TO_RIGHT",
    hierarchy: ["SEASON", "EPISODE", "SEQUENCE", "PANEL"],
    nativeUnits: ["PANEL", "SEQUENCE"],
    pacingModel: ["episode_hook", "panel_density", "serial_progression"],
    visualGrammar: ["full_color_optional", "cinematic_panel", "reaction_panel"],
    productionStages: ["script", "thumbnail", "lineart", "color", "lettering"],
    requiredCompilerCapabilities: ["serial_layout", "panel_rhythm", "episode_serialization"]
  },

  manhua: {
    id: "media-profile:manhua:v0.1",
    target: "MANHUA",
    family: "SEQUENTIAL_ART",
    readingDirection: "LEFT_TO_RIGHT",
    hierarchy: ["VOLUME", "CHAPTER", "PAGE_OR_SCROLL_SEQUENCE", "PANEL"],
    nativeUnits: ["PAGE", "PANEL", "SCROLL_SEQUENCE"],
    pacingModel: ["chapter_hook", "panel_density"],
    visualGrammar: ["full_color_optional", "cinematic_panel"],
    productionStages: ["script", "thumbnail", "lineart", "color", "lettering"],
    requiredCompilerCapabilities: ["page_or_scroll_layout", "panel_rhythm"]
  },

  lightNovel: {
    id: "media-profile:light-novel:v0.1",
    target: "LIGHT_NOVEL",
    family: "LITERATURE",
    readingDirection: "LEFT_TO_RIGHT",
    hierarchy: ["VOLUME", "CHAPTER", "SECTION", "PARAGRAPH"],
    nativeUnits: ["PROSE_BLOCK", "DIALOGUE_BLOCK", "ILLUSTRATION_SLOT"],
    pacingModel: ["chapter_hook", "dialogue_density", "illustration_checkpoint"],
    visualGrammar: ["cover_art", "chapter_illustration", "character_insert"],
    productionStages: ["outline", "draft", "revision", "illustration_plan", "layout"],
    requiredCompilerCapabilities: ["prose_realization", "illustration_slotting", "volume_serialization"]
  },

  animeShort: {
    id: "media-profile:anime-short:v0.1",
    target: "ANIME_SHORT",
    family: "AUDIOVISUAL",
    readingDirection: "NOT_APPLICABLE",
    hierarchy: ["SHORT", "SEQUENCE", "SCENE", "SHOT"],
    nativeUnits: ["SHOT", "CUT", "KEY_POSE"],
    pacingModel: ["shot_duration", "cut_rhythm", "audio_visual_sync"],
    visualGrammar: ["anime_layout", "impact_frame", "hold_frame", "reaction_cut", "sakuga_priority"],
    productionStages: [
      "script",
      "storyboard",
      "layout",
      "key_animation",
      "inbetween",
      "background",
      "color",
      "voice",
      "music",
      "sfx",
      "compositing",
      "edit"
    ],
    requiredCompilerCapabilities: [
      "shot_planning",
      "storyboard_generation",
      "timing",
      "character_continuity",
      "asset_traceability"
    ]
  },

  animeEpisode: {
    id: "media-profile:anime-episode:v0.1",
    target: "ANIME_EPISODE",
    family: "AUDIOVISUAL",
    readingDirection: "NOT_APPLICABLE",
    hierarchy: ["SERIES", "SEASON", "EPISODE", "SEQUENCE", "SCENE", "SHOT"],
    nativeUnits: ["EPISODE", "SHOT", "CUT", "KEY_POSE"],
    pacingModel: ["episode_structure", "shot_duration", "act_break", "cliffhanger"],
    visualGrammar: ["anime_layout", "impact_frame", "hold_frame", "reaction_cut", "sakuga_priority"],
    productionStages: [
      "series_composition",
      "episode_script",
      "storyboard",
      "layout",
      "key_animation",
      "inbetween",
      "background",
      "color",
      "voice",
      "music",
      "sfx",
      "compositing",
      "edit"
    ],
    requiredCompilerCapabilities: [
      "episode_serialization",
      "shot_planning",
      "storyboard_generation",
      "timing",
      "character_continuity",
      "asset_traceability"
    ]
  },

  animeSeries: {
    id: "media-profile:anime-series:v0.1",
    target: "ANIME_SERIES",
    family: "AUDIOVISUAL",
    readingDirection: "NOT_APPLICABLE",
    hierarchy: ["SERIES", "SEASON", "COUR", "EPISODE", "SEQUENCE", "SCENE", "SHOT"],
    nativeUnits: ["COUR", "EPISODE", "SHOT"],
    pacingModel: ["season_arc", "cour_arc", "episode_arc", "cliffhanger", "recap_policy"],
    visualGrammar: ["series_style_bible", "anime_layout", "sakuga_priority"],
    productionStages: ["series_bible", "series_composition", "episode_pipeline", "postproduction"],
    requiredCompilerCapabilities: [
      "series_arc_planning",
      "episode_serialization",
      "cross_episode_continuity",
      "asset_reuse",
      "style_bible_enforcement"
    ]
  }
};

export function getMediaProfile(id: keyof typeof MEDIA_PROFILES): MediaProfile | undefined {
  return MEDIA_PROFILES[id];
}
