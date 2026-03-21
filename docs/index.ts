/**
 * @almadar/ui/docs
 *
 * SSR-safe subset of @almadar/ui for documentation sites.
 * Contains doc-specific molecules composed from @almadar/ui atoms.
 * Designed to eventually replace Docusaurus's built-in doc components.
 *
 * Atoms are re-exported from @almadar/ui/marketing for convenience.
 */

// Atoms (re-exported for convenience in doc swizzles)
export { Box } from '../components/atoms/Box';
export { VStack, HStack } from '../components/atoms/Stack';
export { Typography } from '../components/atoms/Typography';
export { Button } from '../components/atoms/Button';
export { Icon } from '../components/atoms/Icon';
export { Card } from '../components/atoms/Card';
export { Divider } from '../components/atoms/Divider';
export { Input } from '../components/atoms/Input';

// Doc Molecules
export { DocSidebar } from '../components/molecules/DocSidebar';
export type { DocSidebarProps, DocSidebarItem } from '../components/molecules/DocSidebar';
export { DocTOC } from '../components/molecules/DocTOC';
export type { DocTOCProps, DocTOCItem } from '../components/molecules/DocTOC';
export { DocBreadcrumb } from '../components/molecules/DocBreadcrumb';
export type { DocBreadcrumbProps, DocBreadcrumbItem } from '../components/molecules/DocBreadcrumb';
export { DocCodeBlock } from '../components/molecules/DocCodeBlock';
export type { DocCodeBlockProps } from '../components/molecules/DocCodeBlock';
export { DocPagination } from '../components/molecules/DocPagination';
export type { DocPaginationProps } from '../components/molecules/DocPagination';
export { DocSearch } from '../components/molecules/DocSearch';
export type { DocSearchProps, DocSearchResult } from '../components/molecules/DocSearch';
