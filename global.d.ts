declare interface Package {
    version: string;
    initGettext(): void;
    initFormat(): void;
}

declare const pkg: Package;
