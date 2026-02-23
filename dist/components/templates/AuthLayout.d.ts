import React from "react";
export interface AuthLayoutProps {
    /** App name */
    appName?: string;
    /** Logo component or URL */
    logo?: React.ReactNode;
    /** Background image URL */
    backgroundImage?: string;
    /** Show branding panel on the side */
    showBranding?: boolean;
    /** Branding panel content */
    brandingContent?: React.ReactNode;
}
export declare const AuthLayout: React.FC<AuthLayoutProps>;
