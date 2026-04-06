import "styled-components";
import type { Theme } from "@/shared/config/theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
