/**
 * Lucide canonical icon name → native platform glyph (Layer 1 Iconography
 * axis, native path). `lib/iconFamily.tsx` resolves a canonical name to a
 * React component for the web/runtime path; this table is the same
 * dispatch for the compiled iOS/Android shells, which have no React DOM to
 * render into and instead need a platform symbol name.
 *
 * Hand-curated (no fuzzy matching — see `resolveNativeIcon`). Covers:
 *   (a) every alias key in `components/core/atoms/Icon.tsx` `iconAliases`
 *       and `lib/iconFamily.tsx` `lucideAliases`
 *   (b) every icon name appearing as an icon-prop `default` or in an
 *       icon-prop description's quoted examples in
 *       `orbital-rust/crates/orbital-compiler/src/baked/patterns-registry.json`
 *   (c) every icon name used by the wave-1 native pattern set's React
 *       components under `components/core/**`
 *   (d) the common Lucide vocabulary: navigation, actions, files,
 *       communication, status, media, arrows, editing.
 *
 * `sfSymbol` values are real SF Symbols 5 names; `materialSymbol` values are
 * real Material Symbols names. Consumed by `almadar-sync icon-map`, which
 * emits `IconMap.swift`/`IconMap.kt` from this table — regenerate with
 * `node tools/almadar-pattern-sync/dist/index.js icon-map` after editing.
 */

export interface NativeIconGlyph {
  sfSymbol: string;
  materialSymbol: string;
}

export const ICON_FALLBACK: NativeIconGlyph = {
  sfSymbol: 'questionmark.circle',
  materialSymbol: 'help',
};

export const ICON_NATIVE_MAP: Readonly<Record<string, NativeIconGlyph>> = {
  // --- navigation & chrome ---
  'home': { sfSymbol: 'house', materialSymbol: 'home' },
  'menu': { sfSymbol: 'line.3.horizontal', materialSymbol: 'menu' },
  'more-horizontal': { sfSymbol: 'ellipsis', materialSymbol: 'more_horiz' },
  'more-vertical': { sfSymbol: 'ellipsis', materialSymbol: 'more_vert' },
  'chevron-right': { sfSymbol: 'chevron.right', materialSymbol: 'chevron_right' },
  'chevron-left': { sfSymbol: 'chevron.left', materialSymbol: 'chevron_left' },
  'chevron-up': { sfSymbol: 'chevron.up', materialSymbol: 'keyboard_arrow_up' },
  'chevron-down': { sfSymbol: 'chevron.down', materialSymbol: 'keyboard_arrow_down' },
  'chevrons-left': { sfSymbol: 'chevron.left.2', materialSymbol: 'keyboard_double_arrow_left' },
  'chevrons-right': { sfSymbol: 'chevron.right.2', materialSymbol: 'keyboard_double_arrow_right' },
  'chevrons-up-down': { sfSymbol: 'chevron.up.chevron.down', materialSymbol: 'unfold_more' },
  'arrow-left': { sfSymbol: 'arrow.left', materialSymbol: 'arrow_back' },
  'arrow-right': { sfSymbol: 'arrow.right', materialSymbol: 'arrow_forward' },
  'arrow-up': { sfSymbol: 'arrow.up', materialSymbol: 'arrow_upward' },
  'arrow-down': { sfSymbol: 'arrow.down', materialSymbol: 'arrow_downward' },
  'arrow-up-right': { sfSymbol: 'arrow.up.right', materialSymbol: 'north_east' },
  'arrow-down-left': { sfSymbol: 'arrow.down.left', materialSymbol: 'south_west' },
  'corner-up-left': { sfSymbol: 'arrow.turn.up.left', materialSymbol: 'subdirectory_arrow_left' },
  'corner-down-right': { sfSymbol: 'arrow.turn.down.right', materialSymbol: 'subdirectory_arrow_right' },
  'external-link': { sfSymbol: 'arrow.up.forward.square', materialSymbol: 'open_in_new' },
  'log-out': { sfSymbol: 'rectangle.portrait.and.arrow.right', materialSymbol: 'logout' },
  'log-in': { sfSymbol: 'arrow.right.square', materialSymbol: 'login' },
  // `left_panel_open`/`right_panel_open` (Material Symbols) have no
  // `Icons.Filled.*` member in androidx `material-icons-extended` (a newer
  // Material-Symbols-only pair) — `first_page`/`last_page` are the closest
  // directional stand-ins that actually compile (verified wave C5).
  'panel-left': { sfSymbol: 'sidebar.left', materialSymbol: 'first_page' },
  'panel-right': { sfSymbol: 'sidebar.right', materialSymbol: 'last_page' },
  'sidebar': { sfSymbol: 'sidebar.left', materialSymbol: 'view_sidebar' },
  'layout-grid': { sfSymbol: 'square.grid.2x2', materialSymbol: 'grid_view' },
  'layout-list': { sfSymbol: 'list.bullet', materialSymbol: 'view_list' },
  'grid': { sfSymbol: 'square.grid.2x2', materialSymbol: 'grid_view' },
  'list': { sfSymbol: 'list.bullet', materialSymbol: 'list' },

  // --- actions ---
  'plus': { sfSymbol: 'plus', materialSymbol: 'add' },
  'plus-circle': { sfSymbol: 'plus.circle', materialSymbol: 'add_circle' },
  'minus': { sfSymbol: 'minus', materialSymbol: 'remove' },
  'minus-circle': { sfSymbol: 'minus.circle', materialSymbol: 'remove_circle' },
  'x': { sfSymbol: 'xmark', materialSymbol: 'close' },
  'close': { sfSymbol: 'xmark', materialSymbol: 'close' },
  'check': { sfSymbol: 'checkmark', materialSymbol: 'check' },
  'check-circle': { sfSymbol: 'checkmark.circle', materialSymbol: 'check_circle' },
  'circle-check': { sfSymbol: 'checkmark.circle', materialSymbol: 'check_circle' },
  'check-square': { sfSymbol: 'checkmark.square', materialSymbol: 'check_box' },
  'x-circle': { sfSymbol: 'xmark.circle', materialSymbol: 'cancel' },
  'trash': { sfSymbol: 'trash', materialSymbol: 'delete' },
  'trash-2': { sfSymbol: 'trash', materialSymbol: 'delete' },
  'edit': { sfSymbol: 'pencil', materialSymbol: 'edit' },
  'edit-2': { sfSymbol: 'pencil', materialSymbol: 'edit' },
  'edit-3': { sfSymbol: 'pencil', materialSymbol: 'edit' },
  'pencil': { sfSymbol: 'pencil', materialSymbol: 'edit' },
  'copy': { sfSymbol: 'doc.on.doc', materialSymbol: 'content_copy' },
  'clipboard': { sfSymbol: 'clipboard', materialSymbol: 'content_paste' },
  'save': { sfSymbol: 'square.and.arrow.down', materialSymbol: 'save' },
  'download': { sfSymbol: 'arrow.down.circle', materialSymbol: 'download' },
  'upload': { sfSymbol: 'arrow.up.circle', materialSymbol: 'upload' },
  'share': { sfSymbol: 'square.and.arrow.up', materialSymbol: 'share' },
  'share-2': { sfSymbol: 'square.and.arrow.up', materialSymbol: 'share' },
  'refresh-cw': { sfSymbol: 'arrow.clockwise', materialSymbol: 'refresh' },
  'refresh': { sfSymbol: 'arrow.clockwise', materialSymbol: 'refresh' },
  'rotate-cw': { sfSymbol: 'arrow.clockwise', materialSymbol: 'rotate_right' },
  'rotate-ccw': { sfSymbol: 'arrow.counterclockwise', materialSymbol: 'rotate_left' },
  'undo': { sfSymbol: 'arrow.uturn.backward', materialSymbol: 'undo' },
  'redo': { sfSymbol: 'arrow.uturn.forward', materialSymbol: 'redo' },
  'filter': { sfSymbol: 'line.3.horizontal.decrease.circle', materialSymbol: 'filter_list' },
  'sliders': { sfSymbol: 'slider.horizontal.3', materialSymbol: 'tune' },
  'search': { sfSymbol: 'magnifyingglass', materialSymbol: 'search' },
  'zoom-in': { sfSymbol: 'plus.magnifyingglass', materialSymbol: 'zoom_in' },
  'zoom-out': { sfSymbol: 'minus.magnifyingglass', materialSymbol: 'zoom_out' },
  'settings': { sfSymbol: 'gearshape', materialSymbol: 'settings' },
  'lock': { sfSymbol: 'lock', materialSymbol: 'lock' },
  'unlock': { sfSymbol: 'lock.open', materialSymbol: 'lock_open' },
  'eye': { sfSymbol: 'eye', materialSymbol: 'visibility' },
  'eye-off': { sfSymbol: 'eye.slash', materialSymbol: 'visibility_off' },
  'link': { sfSymbol: 'link', materialSymbol: 'link' },
  'link-2': { sfSymbol: 'link', materialSymbol: 'link' },
  'send': { sfSymbol: 'paperplane', materialSymbol: 'send' },
  'power': { sfSymbol: 'power', materialSymbol: 'power_settings_new' },
  'scissors': { sfSymbol: 'scissors', materialSymbol: 'content_cut' },
  // `ink_eraser` has no `Icons.Filled.*` member in androidx
  // `material-icons-extended` (newer Material-Symbols-only) — `backspace`
  // is the closest "erase" glyph that actually compiles (verified wave C5).
  'eraser': { sfSymbol: 'eraser', materialSymbol: 'backspace' },
  'stop': { sfSymbol: 'stop.fill', materialSymbol: 'stop' },
  'sort-asc': { sfSymbol: 'arrow.up', materialSymbol: 'arrow_upward' },
  'sort-desc': { sfSymbol: 'arrow.down', materialSymbol: 'arrow_downward' },

  // --- files ---
  'file': { sfSymbol: 'doc', materialSymbol: 'description' },
  'file-text': { sfSymbol: 'doc.text', materialSymbol: 'description' },
  'file-plus': { sfSymbol: 'doc.badge.plus', materialSymbol: 'note_add' },
  'file-minus': { sfSymbol: 'doc.badge.minus', materialSymbol: 'note' },
  'file-code': { sfSymbol: 'chevron.left.forwardslash.chevron.right', materialSymbol: 'code' },
  'file-json': { sfSymbol: 'curlybraces', materialSymbol: 'data_object' },
  'file-warning': { sfSymbol: 'exclamationmark.triangle', materialSymbol: 'warning' },
  'folder': { sfSymbol: 'folder', materialSymbol: 'folder' },
  'folder-open': { sfSymbol: 'folder', materialSymbol: 'folder_open' },
  'paperclip': { sfSymbol: 'paperclip', materialSymbol: 'attach_file' },
  'image': { sfSymbol: 'photo', materialSymbol: 'image' },
  'archive': { sfSymbol: 'archivebox', materialSymbol: 'archive' },
  'printer': { sfSymbol: 'printer', materialSymbol: 'print' },
  'book': { sfSymbol: 'book', materialSymbol: 'menu_book' },
  'bookmark': { sfSymbol: 'bookmark', materialSymbol: 'bookmark' },

  // --- communication ---
  'mail': { sfSymbol: 'envelope', materialSymbol: 'mail' },
  'inbox': { sfSymbol: 'tray', materialSymbol: 'inbox' },
  'message-circle': { sfSymbol: 'bubble.left', materialSymbol: 'chat_bubble' },
  'message-square': { sfSymbol: 'bubble.left', materialSymbol: 'forum' },
  'phone': { sfSymbol: 'phone', materialSymbol: 'call' },
  'bell': { sfSymbol: 'bell', materialSymbol: 'notifications' },
  'bell-off': { sfSymbol: 'bell.slash', materialSymbol: 'notifications_off' },
  'user': { sfSymbol: 'person', materialSymbol: 'person' },
  'users': { sfSymbol: 'person.2', materialSymbol: 'group' },
  'user-plus': { sfSymbol: 'person.badge.plus', materialSymbol: 'person_add' },
  'user-circle': { sfSymbol: 'person.crop.circle', materialSymbol: 'account_circle' },

  // --- status ---
  'info': { sfSymbol: 'info.circle', materialSymbol: 'info' },
  'alert-circle': { sfSymbol: 'exclamationmark.circle', materialSymbol: 'error' },
  'alert-triangle': { sfSymbol: 'exclamationmark.triangle', materialSymbol: 'warning' },
  'help-circle': { sfSymbol: 'questionmark.circle', materialSymbol: 'help' },
  'star': { sfSymbol: 'star', materialSymbol: 'star' },
  'star-half': { sfSymbol: 'star.leadinghalf.filled', materialSymbol: 'star_half' },
  'heart': { sfSymbol: 'heart', materialSymbol: 'favorite' },
  'flag': { sfSymbol: 'flag', materialSymbol: 'flag' },
  'tag': { sfSymbol: 'tag', materialSymbol: 'label' },
  'clock': { sfSymbol: 'clock', materialSymbol: 'schedule' },
  'calendar': { sfSymbol: 'calendar', materialSymbol: 'calendar_month' },
  // `progress_activity` has no `Icons.Filled.*` member in androidx
  // `material-icons-extended` (newer Material-Symbols-only) — `autorenew`
  // is the closest spinner/loading glyph that actually compiles (verified
  // wave C5).
  'loader': { sfSymbol: 'arrow.triangle.2.circlepath', materialSymbol: 'autorenew' },
  'loader-2': { sfSymbol: 'arrow.triangle.2.circlepath', materialSymbol: 'autorenew' },
  'activity': { sfSymbol: 'waveform.path.ecg', materialSymbol: 'monitor_heart' },
  'smile': { sfSymbol: 'face.smiling', materialSymbol: 'sentiment_satisfied' },

  // --- media ---
  'play': { sfSymbol: 'play.fill', materialSymbol: 'play_arrow' },
  'pause': { sfSymbol: 'pause.fill', materialSymbol: 'pause' },
  'skip-forward': { sfSymbol: 'forward.fill', materialSymbol: 'skip_next' },
  'skip-back': { sfSymbol: 'backward.fill', materialSymbol: 'skip_previous' },
  'volume-2': { sfSymbol: 'speaker.wave.2', materialSymbol: 'volume_up' },
  'volume': { sfSymbol: 'speaker.wave.2', materialSymbol: 'volume_up' },
  'volume-x': { sfSymbol: 'speaker.slash', materialSymbol: 'volume_off' },
  'volume-off': { sfSymbol: 'speaker.slash', materialSymbol: 'volume_off' },
  'camera': { sfSymbol: 'camera', materialSymbol: 'photo_camera' },
  'mic': { sfSymbol: 'mic', materialSymbol: 'mic' },
  'video': { sfSymbol: 'video', materialSymbol: 'videocam' },

  // --- editing / typography ---
  'type': { sfSymbol: 'textformat', materialSymbol: 'text_fields' },
  'bold': { sfSymbol: 'bold', materialSymbol: 'format_bold' },
  'italic': { sfSymbol: 'italic', materialSymbol: 'format_italic' },
  'underline': { sfSymbol: 'underline', materialSymbol: 'format_underlined' },
  'align-left': { sfSymbol: 'text.alignleft', materialSymbol: 'format_align_left' },
  'wrap-text': { sfSymbol: 'text.append', materialSymbol: 'wrap_text' },
  'columns': { sfSymbol: 'rectangle.split.2x1', materialSymbol: 'view_column' },
  'git-commit': { sfSymbol: 'circle.and.line.horizontal', materialSymbol: 'commit' },
  'diamond': { sfSymbol: 'diamond', materialSymbol: 'diamond' },
  'align-center': { sfSymbol: 'text.aligncenter', materialSymbol: 'format_align_center' },
  'align-right': { sfSymbol: 'text.alignright', materialSymbol: 'format_align_right' },
  'indent': { sfSymbol: 'increase.indent', materialSymbol: 'format_indent_increase' },

  // --- misc ---
  'shopping-cart': { sfSymbol: 'cart', materialSymbol: 'shopping_cart' },
  'credit-card': { sfSymbol: 'creditcard', materialSymbol: 'credit_card' },
  'map-pin': { sfSymbol: 'mappin', materialSymbol: 'location_on' },
  'globe': { sfSymbol: 'globe', materialSymbol: 'public' },
  'wifi': { sfSymbol: 'wifi', materialSymbol: 'wifi' },
  'battery': { sfSymbol: 'battery.100', materialSymbol: 'battery_full' },
  'moon': { sfSymbol: 'moon', materialSymbol: 'dark_mode' },
  'sun': { sfSymbol: 'sun.max', materialSymbol: 'light_mode' },
  'square': { sfSymbol: 'square', materialSymbol: 'crop_square' },
  'circle': { sfSymbol: 'circle', materialSymbol: 'circle' },

  // --- behavior-registry vocabulary ---
  'book-open': { sfSymbol: 'book', materialSymbol: 'menu_book' },
  'calendar-clock': { sfSymbol: 'calendar.badge.clock', materialSymbol: 'event_note' },
  'circle-dot': { sfSymbol: 'circle.inset.filled', materialSymbol: 'radio_button_checked' },
  'dollar-sign': { sfSymbol: 'dollarsign', materialSymbol: 'attach_money' },
  'history': { sfSymbol: 'clock.arrow.circlepath', materialSymbol: 'history' },
  'image-plus': { sfSymbol: 'photo.badge.plus', materialSymbol: 'add_photo_alternate' },
  'layers': { sfSymbol: 'square.3.layers.3d', materialSymbol: 'layers' },
  'layout-dashboard': { sfSymbol: 'rectangle.3.group', materialSymbol: 'dashboard' },
  'message-square-plus': { sfSymbol: 'plus.bubble', materialSymbol: 'add_comment' },
  'messages-square': { sfSymbol: 'bubble.left.and.bubble.right', materialSymbol: 'forum' },
  'mouse-pointer-click': { sfSymbol: 'cursorarrow.click', materialSymbol: 'touch_app' },
  'package': { sfSymbol: 'shippingbox', materialSymbol: 'inventory_2' },
  // SF Symbols has no search-with-x glyph; `magnifyingglass` is the nearest.
  'search-x': { sfSymbol: 'magnifyingglass', materialSymbol: 'search_off' },
  'shield': { sfSymbol: 'shield', materialSymbol: 'shield' },
  'sparkles': { sfSymbol: 'sparkles', materialSymbol: 'auto_awesome' },
  'step-forward': { sfSymbol: 'forward.end.fill', materialSymbol: 'skip_next' },
  'thumbs-up': { sfSymbol: 'hand.thumbsup', materialSymbol: 'thumb_up' },
  'trending-down': { sfSymbol: 'chart.line.downtrend.xyaxis', materialSymbol: 'trending_down' },
  'trending-up': { sfSymbol: 'chart.line.uptrend.xyaxis', materialSymbol: 'trending_up' },
  'user-check': { sfSymbol: 'person.crop.circle.badge.checkmark', materialSymbol: 'how_to_reg' },
  // SF Symbols has no unlink glyph; `link` is the nearest (Material has `link_off`).
  'arrow-right-circle': { sfSymbol: 'arrow.right.circle', materialSymbol: 'arrow_circle_right' },
  'atom': { sfSymbol: 'atom', materialSymbol: 'science' },
  'ban': { sfSymbol: 'nosign', materialSymbol: 'block' },
  'bookmark-plus': { sfSymbol: 'bookmark', materialSymbol: 'bookmark_add' },
  'briefcase': { sfSymbol: 'briefcase', materialSymbol: 'work' },
  'building-2': { sfSymbol: 'building.2', materialSymbol: 'business' },
  'clipboard-check': { sfSymbol: 'checklist', materialSymbol: 'assignment_turned_in' },
  'dices': { sfSymbol: 'dice', materialSymbol: 'casino' },
  'dna': { sfSymbol: 'cross.vial', materialSymbol: 'biotech' },
  'door-open': { sfSymbol: 'door.left.hand.open', materialSymbol: 'meeting_room' },
  'feather': { sfSymbol: 'pencil.line', materialSymbol: 'draw' },
  'file-signature': { sfSymbol: 'signature', materialSymbol: 'history_edu' },
  'file-up': { sfSymbol: 'arrow.up.doc', materialSymbol: 'upload_file' },
  'flame': { sfSymbol: 'flame', materialSymbol: 'local_fire_department' },
  'flask-conical': { sfSymbol: 'flask', materialSymbol: 'science' },
  'gift': { sfSymbol: 'gift', materialSymbol: 'card_giftcard' },
  'handshake': { sfSymbol: 'person.2', materialSymbol: 'handshake' },
  'key-round': { sfSymbol: 'key', materialSymbol: 'vpn_key' },
  'languages': { sfSymbol: 'globe', materialSymbol: 'translate' },
  'leaf': { sfSymbol: 'leaf', materialSymbol: 'eco' },
  'lightbulb': { sfSymbol: 'lightbulb', materialSymbol: 'lightbulb' },
  'mail-plus': { sfSymbol: 'envelope.badge', materialSymbol: 'forward_to_inbox' },
  'maximize-2': { sfSymbol: 'arrow.up.left.and.arrow.down.right', materialSymbol: 'open_in_full' },
  'network': { sfSymbol: 'network', materialSymbol: 'hub' },
  'presentation': { sfSymbol: 'play.rectangle', materialSymbol: 'slideshow' },
  'repeat': { sfSymbol: 'repeat', materialSymbol: 'repeat' },
  'route': { sfSymbol: 'point.topleft.down.to.point.bottomright.curvepath', materialSymbol: 'route' },
  'ruler': { sfSymbol: 'ruler', materialSymbol: 'straighten' },
  'scale': { sfSymbol: 'scalemass', materialSymbol: 'balance' },
  'scroll': { sfSymbol: 'scroll', materialSymbol: 'receipt_long' },
  'shield-check': { sfSymbol: 'checkmark.shield', materialSymbol: 'verified_user' },
  'sigma': { sfSymbol: 'sum', materialSymbol: 'functions' },
  'sticky-note': { sfSymbol: 'note.text', materialSymbol: 'sticky_note_2' },
  'store': { sfSymbol: 'storefront', materialSymbol: 'store' },
  'target': { sfSymbol: 'scope', materialSymbol: 'gps_fixed' },
  'unlink': { sfSymbol: 'link', materialSymbol: 'link_off' },
};

/**
 * Every non-standard name from `iconAliases` (`components/core/atoms/Icon.tsx`)
 * and `lucideAliases` (`lib/iconFamily.tsx`) — the names that don't kebab→Pascal
 * to a real Lucide export. Each one is also a first-class `ICON_NATIVE_MAP` key
 * (requirement (a)); exported so the alias set has one pinned source of truth
 * a test can check against, independent of whatever else the map grows to cover.
 */
export const ICON_ALIASES: ReadonlyArray<string> = [
  'close', 'trash', 'loader', 'stop', 'volume', 'volume-off', 'refresh',
  'share', 'sort-asc', 'sort-desc',
];

/** Exact key match, then an `iconAliases` alias, then the deterministic fallback — no fuzzy matching. */
export function resolveNativeIcon(name: string): NativeIconGlyph {
  const direct = ICON_NATIVE_MAP[name];
  if (direct) return direct;
  if (ICON_ALIASES.includes(name)) {
    const aliased = ICON_NATIVE_MAP[name];
    if (aliased) return aliased;
  }
  return ICON_FALLBACK;
}
