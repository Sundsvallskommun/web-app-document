import { CookieConsent, Button, Image, Footer, Header, Link } from '@sk-web-gui/react';
import { useUserStore } from '@services/user-service/user-service';
import { shallow } from 'zustand/shallow';
import { capitalize } from 'underscore.string';

import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface DefaultLayoutProps {
  children: React.ReactNode;
  title?: string;
  postTitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  preContent?: React.ReactNode;
  postContent?: React.ReactNode;
  logoLinkHref?: string;
}

export default function DefaultLayout({
  title,
  postTitle,
  headerTitle,
  headerSubtitle,
  children,
  preContent = undefined,
  postContent = undefined,
  logoLinkHref = '/',
}: DefaultLayoutProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user, shallow);
  const { pathname, asPath, query } = router;  
  const layoutTitle = `${process.env.NEXT_PUBLIC_APP_NAME}${headerSubtitle ? ` - ${headerSubtitle}` : ''}`;
  const fullTitle = postTitle ? `${layoutTitle} - ${postTitle}` : `${layoutTitle}`;

  const { t } = useTranslation();

  const setFocusToMain = () => {
    const contentElement = document.getElementById('content');
    contentElement.focus();
  };

  const handleLogoClick = () => {
    router.push(logoLinkHref);
  };

  const handleLanguageChange = (langValue: string) => {
    router.push({ pathname, query }, asPath, { locale: langValue });
  };
  
  return (
    <div className="DefaultLayout full-page-layout">
      <Head>
        <title>{title ? title : fullTitle}</title>
        <meta name="description" content={`${process.env.NEXT_PUBLIC_APP_NAME}`} />
      </Head>

      <NextLink href="#content" legacyBehavior passHref>
        <a onClick={setFocusToMain} accessKey="s" className="next-link-a" data-cy="systemMessage-a">
          {t('layout:header.goto_content')}
        </a>
      </NextLink>

      <Header
        data-cy="nav-header"
        title={headerTitle ? headerTitle : process.env.NEXT_PUBLIC_APP_NAME}
        subtitle={headerSubtitle ? headerSubtitle : ''}
        aria-label={`${headerTitle ? headerTitle : process.env.NEXT_PUBLIC_APP_NAME} ${headerSubtitle}`}
        logoLinkOnClick={handleLogoClick}
        LogoLinkWrapperComponent={<NextLink legacyBehavior href={logoLinkHref} passHref />}
      >
      
        <div className='language-bar'>
          <Button.Group>
            <Button iconButton onClick={() => handleLanguageChange('sv')}>
              <Image alt='Svenska' htmlHeight='42' htmlWidth='26' src='/png/se.png'/>
            </Button>

            <Button iconButton onClick={() => handleLanguageChange('en')}>
              <Image alt='Engelska' htmlHeight='42' htmlWidth='26' src='/png/en.png'/>
            </Button>
            
            {user.name ?
              <Button>
                <NextLink href={`/logout`}>
                  <Link as="span" variant="link">
                    {capitalize(t('common:logout'))}
                  </Link>
                </NextLink>
              </Button>
            : ''}
            
          </Button.Group>
        </div>
      
      </Header>

      {preContent && preContent}

      <div className={`main-container flex-grow relative w-full flex flex-col`}>
        <div className="main-content-padding">{children}</div>
      </div>

      {postContent && postContent}

      <Footer></Footer>

      <CookieConsent
        title={t('layout:cookies.title', { app: process.env.NEXT_PUBLIC_APP_NAME })}
        body={
          <p>
            {t('layout:cookies.description')}{' '}
            <NextLink href="/kakor" passHref legacyBehavior>
              <Link>{t('layout:cookies.read_more')}</Link>
            </NextLink>
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: t('layout:cookies.necessary.displayName'),
            description: t('layout:cookies.necessary.description'),
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: t('layout:cookies.func.displayName'),
            description: t('layout:cookies.func.description'),
            cookieName: 'func',
          },
          {
            optional: true,
            displayName: t('layout:cookies.stats.displayName'),
            description: t('layout:cookies.stats.description'),
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={() => {
          // FIXME: do stuff with cookies?
          // NO ANO FUNCTIONS
        }}
      />
    </div>
  );
}
