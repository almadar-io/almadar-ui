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
export { Box } from '../components/core/atoms/Box';
export { VStack, HStack } from '../components/core/atoms/Stack';
export { Typography } from '../components/core/atoms/Typography';
export { Button } from '../components/core/atoms/Button';
export { Icon } from '../components/core/atoms/Icon';
export { Card } from '../components/core/atoms/Card';
export { Divider } from '../components/core/atoms/Divider';
export { Input } from '../components/core/atoms/Input';

// Doc Molecules
export { DocSidebar } from '../components/core/molecules/DocSidebar';
export type { DocSidebarProps, DocSidebarItem } from '../components/core/molecules/DocSidebar';
export { DocTOC } from '../components/core/molecules/DocTOC';
export type { DocTOCProps, DocTOCItem } from '../components/core/molecules/DocTOC';
export { DocBreadcrumb } from '../components/core/molecules/DocBreadcrumb';
export type { DocBreadcrumbProps, DocBreadcrumbItem } from '../components/core/molecules/DocBreadcrumb';
export { DocCodeBlock } from '../components/core/molecules/DocCodeBlock';
export type { DocCodeBlockProps } from '../components/core/molecules/DocCodeBlock';
export { DocPagination } from '../components/core/molecules/DocPagination';
export type { DocPaginationProps } from '../components/core/molecules/DocPagination';
export { DocSearch } from '../components/core/molecules/DocSearch';
export type { DocSearchProps, DocSearchResult } from '../components/core/molecules/DocSearch';
