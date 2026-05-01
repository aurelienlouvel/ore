import type {IconSvgElement} from '@hugeicons/react'
import {
  // Work / Business
  Briefcase01Icon,
  CalendarIcon,
  Certificate01Icon,
  AwardIcon,
  MedalFirstPlaceIcon,
  DiamondIcon,
  WorkflowSquare01Icon,
  Building01Icon,
  Building04Icon,
  Link01Icon,
  GlobeIcon,
  // Design / Creative
  PenTool01Icon,
  PaintBrush01Icon,
  PaintBoardIcon,
  BrushIcon,
  FigmaIcon,
  FramerIcon,
  MagicWand01Icon,
  Layers01Icon,
  Layout01Icon,
  Image01Icon,
  SparklesIcon,
  BulbIcon,
  Idea01Icon,
  Motion01Icon,
  // Development
  CodeIcon,
  CodeSquareIcon,
  TerminalIcon,
  Database01Icon,
  FolderCodeIcon,
  FolderLibraryIcon,
  // People / Social
  UserIcon,
  UserGroupIcon,
  UserStarIcon,
  UserMultipleIcon,
  Linkedin01Icon,
  // Media
  CameraIcon,
  VideoIcon,
  MusicNote01Icon,
  // Labels / Status
  TagIcon,
  Tag01Icon,
  LabelIcon,
  StarIcon,
  HeartCheckIcon,
  CrownIcon,
} from '@hugeicons/core-free-icons'

export type IconEntry = {
  name: string
  label: string
  icon: IconSvgElement
  category: string
}

export const curatedIconList: IconEntry[] = [
  // Work
  {name: 'Briefcase01Icon', label: 'Briefcase', icon: Briefcase01Icon, category: 'Work'},
  {name: 'CalendarIcon', label: 'Calendar', icon: CalendarIcon, category: 'Work'},
  {name: 'Certificate01Icon', label: 'Certificate', icon: Certificate01Icon, category: 'Work'},
  {name: 'AwardIcon', label: 'Award', icon: AwardIcon, category: 'Work'},
  {name: 'MedalFirstPlaceIcon', label: 'Medal', icon: MedalFirstPlaceIcon, category: 'Work'},
  {name: 'DiamondIcon', label: 'Diamond', icon: DiamondIcon, category: 'Work'},
  {name: 'WorkflowSquare01Icon', label: 'Workflow', icon: WorkflowSquare01Icon, category: 'Work'},
  {name: 'Building01Icon', label: 'Building', icon: Building01Icon, category: 'Work'},
  {name: 'Building04Icon', label: 'Office', icon: Building04Icon, category: 'Work'},
  {name: 'Link01Icon', label: 'Link', icon: Link01Icon, category: 'Work'},
  {name: 'GlobeIcon', label: 'Globe', icon: GlobeIcon, category: 'Work'},
  // Design
  {name: 'PenTool01Icon', label: 'Pen Tool', icon: PenTool01Icon, category: 'Design'},
  {name: 'PaintBrush01Icon', label: 'Paint Brush', icon: PaintBrush01Icon, category: 'Design'},
  {name: 'PaintBoardIcon', label: 'Paint Board', icon: PaintBoardIcon, category: 'Design'},
  {name: 'BrushIcon', label: 'Brush', icon: BrushIcon, category: 'Design'},
  {name: 'FigmaIcon', label: 'Figma', icon: FigmaIcon, category: 'Design'},
  {name: 'FramerIcon', label: 'Framer', icon: FramerIcon, category: 'Design'},
  {name: 'MagicWand01Icon', label: 'Magic Wand', icon: MagicWand01Icon, category: 'Design'},
  {name: 'Layers01Icon', label: 'Layers', icon: Layers01Icon, category: 'Design'},
  {name: 'Layout01Icon', label: 'Layout', icon: Layout01Icon, category: 'Design'},
  {name: 'Image01Icon', label: 'Image', icon: Image01Icon, category: 'Design'},
  {name: 'SparklesIcon', label: 'Sparkles', icon: SparklesIcon, category: 'Design'},
  {name: 'BulbIcon', label: 'Bulb', icon: BulbIcon, category: 'Design'},
  {name: 'Idea01Icon', label: 'Idea', icon: Idea01Icon, category: 'Design'},
  {name: 'Motion01Icon', label: 'Motion', icon: Motion01Icon, category: 'Design'},
  // Development
  {name: 'CodeIcon', label: 'Code', icon: CodeIcon, category: 'Dev'},
  {name: 'CodeSquareIcon', label: 'Code Block', icon: CodeSquareIcon, category: 'Dev'},
  {name: 'TerminalIcon', label: 'Terminal', icon: TerminalIcon, category: 'Dev'},
  {name: 'Database01Icon', label: 'Database', icon: Database01Icon, category: 'Dev'},
  {name: 'FolderCodeIcon', label: 'Code Folder', icon: FolderCodeIcon, category: 'Dev'},
  {name: 'FolderLibraryIcon', label: 'Library', icon: FolderLibraryIcon, category: 'Dev'},
  // People
  {name: 'UserIcon', label: 'User', icon: UserIcon, category: 'People'},
  {name: 'UserGroupIcon', label: 'Group', icon: UserGroupIcon, category: 'People'},
  {name: 'UserStarIcon', label: 'Star User', icon: UserStarIcon, category: 'People'},
  {name: 'UserMultipleIcon', label: 'Team', icon: UserMultipleIcon, category: 'People'},
  {name: 'Linkedin01Icon', label: 'LinkedIn', icon: Linkedin01Icon, category: 'People'},
  // Media
  {name: 'CameraIcon', label: 'Camera', icon: CameraIcon, category: 'Media'},
  {name: 'VideoIcon', label: 'Video', icon: VideoIcon, category: 'Media'},
  {name: 'MusicNote01Icon', label: 'Music', icon: MusicNote01Icon, category: 'Media'},
  // Labels
  {name: 'TagIcon', label: 'Tag', icon: TagIcon, category: 'Labels'},
  {name: 'Tag01Icon', label: 'Tag Alt', icon: Tag01Icon, category: 'Labels'},
  {name: 'LabelIcon', label: 'Label', icon: LabelIcon, category: 'Labels'},
  {name: 'StarIcon', label: 'Star', icon: StarIcon, category: 'Labels'},
  {name: 'HeartCheckIcon', label: 'Heart', icon: HeartCheckIcon, category: 'Labels'},
  {name: 'CrownIcon', label: 'Crown', icon: CrownIcon, category: 'Labels'},
]

export const hugeIconMap: Record<string, IconSvgElement> = Object.fromEntries(
  curatedIconList.map(({name, icon}) => [name, icon]),
)
