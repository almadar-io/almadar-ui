import React from "react";
export type CardShadow = "none" | "sm" | "md" | "lg";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "bordered" | "elevated" | "interactive";
    padding?: "none" | "sm" | "md" | "lg";
    /** Card title - renders in header if provided */
    title?: string;
    /** Card subtitle - renders below title */
    subtitle?: string;
    /** Shadow size override */
    shadow?: CardShadow;
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
