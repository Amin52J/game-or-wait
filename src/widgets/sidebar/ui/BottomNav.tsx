"use client";

import { useRouter } from "next/navigation";
import { useNavigation } from "@/app/providers/NavigationProvider";
import { Icon } from "@/shared/ui";
import { isNavActive } from "./Sidebar.utils";
import { BottomNavRoot, BottomNavItem, BottomNavIcon, BottomNavLabel } from "./BottomNav.styles";

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { activePath, setIntent } = useNavigation();

  const navigate = (path: string) => {
    setIntent(path);
    router.push(path);
  };

  return (
    <BottomNavRoot aria-label="Bottom navigation">
      <BottomNavItem type="button" $active={false} onClick={onMenuClick}>
        <BottomNavIcon>
          <Icon name="menu" size={20} />
        </BottomNavIcon>
        <BottomNavLabel>Menu</BottomNavLabel>
      </BottomNavItem>

      <BottomNavItem
        type="button"
        $active={isNavActive(activePath, "/analyze")}
        onClick={() => navigate("/analyze")}
      >
        <BottomNavIcon>
          <Icon name="search" size={20} />
        </BottomNavIcon>
        <BottomNavLabel>Analyze</BottomNavLabel>
      </BottomNavItem>

      <BottomNavItem
        type="button"
        $active={isNavActive(activePath, "/library")}
        onClick={() => navigate("/library")}
      >
        <BottomNavIcon>
          <Icon name="library" size={20} />
        </BottomNavIcon>
        <BottomNavLabel>Library</BottomNavLabel>
      </BottomNavItem>

      <BottomNavItem
        type="button"
        $active={isNavActive(activePath, "/history")}
        onClick={() => navigate("/history")}
      >
        <BottomNavIcon>
          <Icon name="history" size={20} />
        </BottomNavIcon>
        <BottomNavLabel>History</BottomNavLabel>
      </BottomNavItem>
    </BottomNavRoot>
  );
}
