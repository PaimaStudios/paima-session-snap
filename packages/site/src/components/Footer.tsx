import styled, { useTheme } from 'styled-components';
import { ReactComponent as MetaMaskFox } from '../assets/metamask_fox.svg';
import { ReactComponent as PaimaLogo } from '../assets/paima.svg';
import { MetaMask } from './MetaMask';
import { Paima } from './Paima';
import { PoweredBy } from './PoweredBy';

const FooterWrapper = styled.footer`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-top: 2.4rem;
  padding-bottom: 2.4rem;
  border-top: 1px solid ${(props) => props.theme.colors.border.default};
`;

const PoweredByButton = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  border-radius: ${({ theme }) => theme.radii.button};
  box-shadow: ${({ theme }) => theme.shadows.button};
  background-color: ${({ theme }) => theme.colors.background.alternative};
`;

const PoweredByContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`;

export const Footer = () => {
  const theme = useTheme();

  return (
    <FooterWrapper>
      <PoweredByButton href="https://docs.metamask.io/" target="_blank">
        <MetaMaskFox />
        <PoweredByContainer>
          <PoweredBy color={theme.colors.text.muted} />
          <MetaMask color={theme.colors.text.default} />
        </PoweredByContainer>
      </PoweredByButton>
      <div style={{ minWidth: '16px' }} />
      <PoweredByButton href="https://docs.paiamstudios.com/" target="_blank">
        <PaimaLogo width="27px" height="26px" viewBox="0 0 1770 1880" />
        <PoweredByContainer>
          <PoweredBy color={theme.colors.text.muted} />
          <Paima color={theme.colors.text.default} />
        </PoweredByContainer>
      </PoweredByButton>
    </FooterWrapper>
  );
};
