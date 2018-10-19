import { colors, constants as sharedConstants, utils as sharedUtils } from '@0x/react-shared';
import * as _ from 'lodash';
import * as React from 'react';
import DocumentTitle = require('react-document-title');
import { DocsLogo } from 'ts/components/documentation/docs_logo';
import { DocsTopBar } from 'ts/components/documentation/docs_top_bar';
import { Container } from 'ts/components/ui/container';
import { Dispatcher } from 'ts/redux/dispatcher';
import { styled } from 'ts/style/theme';
import { BrowserType, ScreenWidths } from 'ts/types';
import { Translate } from 'ts/utils/translate';
import { utils } from 'ts/utils/utils';

const THROTTLE_TIMEOUT = 100;
const TOP_BAR_HEIGHT = 80;
const browserType = utils.getBrowserType();
const SCROLLER_WIDTH = browserType === BrowserType.Firefox ? 15 : 4;
const SIDEBAR_PADDING = 22;

export interface DevelopersPageProps {
    location: Location;
    translate: Translate;
    screenWidth: ScreenWidths;
    dispatcher: Dispatcher;
    mainContent: React.ReactNode;
    sidebar: React.ReactNode;
}

export interface DevelopersPageState {
    isSidebarScrolling: boolean;
}

const isUserOnMobile = sharedUtils.isUserOnMobile();

const scrollableContainerStyles = `
    position: absolute;
    top: 80px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    overflow-x: hidden;
    overflow-y: scroll;
    min-height: calc(100vh - ${TOP_BAR_HEIGHT}px);
    -webkit-overflow-scrolling: touch;
`;

interface SidebarContainerProps {
    className?: string;
}

const SidebarContainer =
    styled.div <
    SidebarContainerProps >
    `
    ${scrollableContainerStyles}
    padding-top: 27px;
    padding-bottom: 100px;
    padding-left: ${SIDEBAR_PADDING}px;
    padding-right: ${SIDEBAR_PADDING}px;
    overflow: hidden;
    &:hover {
        overflow: auto;
        padding-right: ${SIDEBAR_PADDING - SCROLLER_WIDTH}px;
    }
`;

interface MainContentContainerProps {
    className?: string;
}

const MainContentContainer =
    styled.div <
    MainContentContainerProps >
    `
    ${scrollableContainerStyles}
    padding-top: 0px;
    padding-left: 50px;
    padding-right: 50px;
    overflow: ${isUserOnMobile ? 'auto' : 'hidden'};
    &:hover {
        padding-right: ${50 - SCROLLER_WIDTH}px;
        overflow: auto;
    }
    @media (max-width: 40em) {
        padding-left: 20px;
        padding-right: 20px;
        &:hover {
            padding-right: ${20 - SCROLLER_WIDTH}px;
            overflow: auto;
        }
    }
`;

export class DevelopersPage extends React.Component<DevelopersPageProps, DevelopersPageState> {
    private readonly _throttledScreenWidthUpdate: () => void;
    private readonly _throttledSidebarScrolling: () => void;
    private _sidebarScrollClearingInterval: number;
    constructor(props: DevelopersPageProps) {
        super(props);
        this._throttledScreenWidthUpdate = _.throttle(this._updateScreenWidth.bind(this), THROTTLE_TIMEOUT);
        this._throttledSidebarScrolling = _.throttle(this._onSidebarScroll.bind(this), THROTTLE_TIMEOUT);
        this.state = {
            isSidebarScrolling: false,
        };
    }
    public componentDidMount(): void {
        window.addEventListener('resize', this._throttledScreenWidthUpdate);
        window.scrollTo(0, 0);
        this._sidebarScrollClearingInterval = window.setInterval(() => {
            this.setState({
                isSidebarScrolling: false,
            });
        }, 1000);
    }
    public componentWillUnmount(): void {
        window.removeEventListener('resize', this._throttledScreenWidthUpdate);
        window.clearInterval(this._sidebarScrollClearingInterval);
    }
    public render(): React.ReactNode {
        const isSmallScreen = this.props.screenWidth === ScreenWidths.Sm;
        const mainContentPadding = isSmallScreen ? 20 : 50;
        return (
            <Container
                className="flex items-center overflow-hidden"
                width="100%"
                background={`linear-gradient(to right, ${colors.grey100} 0%, ${colors.grey100} 50%, ${
                    colors.white
                } 50%, ${colors.white} 100%)`}
            >
                <DocumentTitle title="0x Docs" />
                <Container className="flex mx-auto" height="100vh">
                    <Container
                        className="sm-hide xs-hide relative"
                        width={234}
                        paddingLeft={22}
                        paddingRight={22}
                        paddingTop={0}
                        backgroundColor={colors.grey100}
                    >
                        <Container
                            borderBottom={this.state.isSidebarScrolling ? `1px solid ${colors.grey300}` : 'none'}
                        >
                            <Container paddingTop="30px" paddingLeft="10px" paddingBottom="8px">
                                <DocsLogo height={36} />
                            </Container>
                        </Container>
                        <SidebarContainer onWheel={this._throttledSidebarScrolling}>
                            {this.props.screenWidth !== ScreenWidths.Sm && this.props.sidebar}
                        </SidebarContainer>
                    </Container>
                    <Container
                        className="relative"
                        width={isSmallScreen ? '100vw' : 786}
                        paddingBottom="100px"
                        backgroundColor={colors.white}
                    >
                        <Container paddingLeft={mainContentPadding} paddingRight={mainContentPadding}>
                            <DocsTopBar
                                location={this.props.location}
                                screenWidth={this.props.screenWidth}
                                translate={this.props.translate}
                                sidebar={this.props.sidebar}
                            />
                        </Container>
                        <MainContentContainer id={sharedConstants.SCROLL_CONTAINER_ID}>
                            {this.props.mainContent}
                        </MainContentContainer>
                    </Container>
                </Container>
            </Container>
        );
    }
    private _onSidebarScroll(_event: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            isSidebarScrolling: true,
        });
    }
    private _updateScreenWidth(): void {
        const newScreenWidth = utils.getScreenWidth();
        this.props.dispatcher.updateScreenWidth(newScreenWidth);
    }
} // tslint:disable:max-file-line-count
