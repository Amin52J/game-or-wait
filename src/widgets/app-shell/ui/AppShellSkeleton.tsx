"use client";

import styled from "styled-components";
import { Skeleton, SkeletonCircle } from "@/shared/ui";

const MOBILE_MAX = "767px";
const TABLET_MIN = "768px";
const TABLET_MAX = "1024px";

const Root = styled.div`
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.bg};
  background-image:
    radial-gradient(
      ellipse 120% 80% at 50% -30%,
      ${({ theme }) => theme.colors.accentGlow} 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 90% 60% at 100% 100%,
      ${({ theme }) => theme.colors.accentMuted} 0%,
      transparent 50%
    ),
    ${({ theme }) => theme.colors.bgGradient};
`;

/* ——— Sidebar skeleton ——— */

const SidebarSkeleton = styled.aside`
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 100vh;
  height: 100dvh;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    width: 64px;
  }

  @media (max-width: ${MOBILE_MAX}) {
    display: none;
  }
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const SidebarLogoText = styled.div`
  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    display: none;
  }
`;

const SidebarNav = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const NavItemSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const NavItemLabel = styled.div`
  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    display: none;
  }
`;

const SidebarFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    padding: ${({ theme }) => theme.spacing.sm};
    align-items: center;
  }
`;

const SidebarFooterDesktop = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;

  @media (min-width: ${TABLET_MIN}) and (max-width: ${TABLET_MAX}) {
    display: none;
  }
`;

/* ——— Mobile menu button skeleton ——— */

const MobileMenuSkeleton = styled.div`
  display: none;

  @media (max-width: ${MOBILE_MAX}) {
    display: block;
    position: fixed;
    left: ${({ theme }) => theme.spacing.md};
    top: ${({ theme }) => theme.spacing.md};
    z-index: 250;
  }
`;

/* ——— Content skeleton ——— */

const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;

  @media (max-width: ${MOBILE_MAX}) {
    padding: ${({ theme }) => theme.spacing.sm};
    padding-top: calc(${({ theme }) => theme.spacing.sm} + 64px);
  }
`;

const ContentInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${MOBILE_MAX}) {
    padding: ${({ theme }) => theme.spacing.sm} 0;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const FormBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${MOBILE_MAX}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const CardBlock = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${MOBILE_MAX}) {
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

/* ——— Centered spinner for auth loading ——— */

const CenteredRoot = styled(Root)`
  align-items: center;
  justify-content: center;
`;

const PulseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export function AuthLoadingSkeleton() {
  return (
    <CenteredRoot>
      <PulseWrapper>
        <SkeletonCircle $width="48px" $height="48px" />
        <Skeleton $width="120px" $height="14px" />
      </PulseWrapper>
    </CenteredRoot>
  );
}

export function HydrationSkeleton() {
  return (
    <Root>
      <MobileMenuSkeleton>
        <Skeleton $width="44px" $height="44px" $radius="8px" />
      </MobileMenuSkeleton>

      <SidebarSkeleton>
        <SidebarLogo>
          <SkeletonCircle $width="32px" $height="32px" $radius="6px" />
          <SidebarLogoText>
            <Skeleton $width="90px" $height="18px" />
          </SidebarLogoText>
        </SidebarLogo>
        <SidebarNav>
          {Array.from({ length: 4 }, (_, i) => (
            <NavItemSkeleton key={i}>
              <Skeleton $width="24px" $height="24px" $radius="6px" />
              <NavItemLabel>
                <Skeleton $width={`${70 + i * 12}px`} $height="14px" />
              </NavItemLabel>
            </NavItemSkeleton>
          ))}
        </SidebarNav>
        <SidebarFooter>
          <SidebarFooterDesktop>
            <Skeleton $width="100px" $height="12px" />
            <Skeleton $width="140px" $height="11px" />
          </SidebarFooterDesktop>
          <Skeleton $width="100%" $height="32px" style={{ marginTop: 8 }} />
        </SidebarFooter>
      </SidebarSkeleton>

      <Content>
        <ContentInner>
          <FormBlock>
            <Skeleton $width="80px" $height="12px" />
            <Skeleton $width="100%" $height="52px" $radius="14px" />
          </FormBlock>
          <FormBlock>
            <Skeleton $width="50px" $height="12px" />
            <Skeleton $width="100%" $height="42px" />
          </FormBlock>
          <Skeleton $width="100%" $height="48px" $radius="10px" />

          <CardBlock>
            <Skeleton $width="60%" $height="16px" />
            <Skeleton $width="100%" $height="12px" />
            <Skeleton $width="90%" $height="12px" />
            <Skeleton $width="75%" $height="12px" />
          </CardBlock>
        </ContentInner>
      </Content>
    </Root>
  );
}
