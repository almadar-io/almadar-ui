import React from "react";
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpinnerSize;
}
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLDivElement>>;
