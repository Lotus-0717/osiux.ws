import React, { Fragment, useEffect } from 'react';
import tw from 'twin.macro';
import Head from 'next/head';
import { Global } from '@emotion/react';

import global from '@app/styles/global';
import tags from '@app/styles/tags';

import Footer from './Footer';
import Navigation from './Navigation';

const Container = tw.div`min-h-screen antialiased grid grid-rows-layout max-w-3xl mx-auto w-full py-6 xl:max-w-4xl px-3 xl:px-0 md:pb-16 md:pt-8`;
const Main = tw.main`my-4 md:my-10`;

type LayoutProps = {
	children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			'serviceWorker' in navigator &&
			// @ts-ignore
			window.workbox !== undefined
		) {
			// @ts-ignore
			const wb = window.workbox;
			// @ts-ignore
			const promptNewVersionAvailable = (event) => {
				// `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
				// When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
				// You may want to customize the UI prompt accordingly.
				if (
					confirm(
						'A newer version of this site is available, reload to update?',
					)
				) {
					// @ts-ignore
					wb.addEventListener('controlling', (event) => {
						window.location.reload();
					});

					// Send a message to the waiting service worker, instructing it to activate.
					wb.messageSW({ type: 'SKIP_WAITING' });
				} else {
					console.log(
						'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.',
					);
				}
			};

			wb.addEventListener('waiting', promptNewVersionAvailable);
			wb.addEventListener('externalwaiting', promptNewVersionAvailable);
		}
	}, []);

	return (
		<Fragment>
			<Global styles={global} />
			<Global styles={tags} />
			<Head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5,user-scalable=yes"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#111827" />
			</Head>
			<Container>
				<Navigation />
				<Main>{children}</Main>
				<Footer />
			</Container>
		</Fragment>
	);
};

export default Layout;
