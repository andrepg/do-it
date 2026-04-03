declare interface Package {
  version: string;
  initGettext(): void;
  initFormat(): void;
}

declare const pkg: Package;

declare function C_(context: string, message: string): string;
