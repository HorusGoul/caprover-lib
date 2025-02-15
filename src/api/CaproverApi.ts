import { ReadStream } from 'fs';
import HttpClient from './HttpClient';
import { IRegistryInfo } from '../models/IRegistryInfo';
import { ICaptainDefinition } from '../models/ICaptainDefinition';
import { IVersionInfo } from '../models/IVersionInfo';
import { IAppDef } from '../models/AppDef';
import IBuildLogs from '../models/IBuildLogs';
import Constants from '../utils/Constants';

export interface CaproverApiParams {
  baseUrl: string;
  password?: string;
  debug?: boolean;
}

export class CaproverApi {
  private authToken: string;
  private http: HttpClient;

  constructor({
    baseUrl,
    password = Constants.DEFAULT_PASSWORD,
    debug = false,
  }: CaproverApiParams) {
    this.authToken = debug
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im5hbWVzcGFjZSI6ImNhcHRhaW4iLCJ0b2tlblZlcnNpb24iOiI5NmRjM2U1MC00ZDk3LTRkNmItYTIzMS04MmNiZjY0ZTA2NTYifSwiaWF0IjoxNTQ1OTg0MDQwLCJleHAiOjE1ODE5ODQwNDB9.uGJyhb2JYsdw9toyMKX28bLVuB0PhnS2POwEjKpchww'
      : '';

    this.http = new HttpClient(baseUrl, this.authToken, () => {
      return this.getAuthToken(password);
    });
  }

  callApi(
    path: string,
    method: 'GET' | 'POST' /*| 'POST_DATA' Not used */,
    data: any,
  ) {
    const http = this.http;

    return Promise.resolve().then(http.fetch(method, path, data));
  }

  destroy() {
    this.http.destroy();
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken;
    this.http.setAuthToken(authToken);
  }

  isLoggedIn() {
    return !!this.authToken;
  }

  getAuthToken(password: string) {
    const http = this.http;
    let authTokenFetched = '';

    return Promise.resolve() //
      .then(http.fetch(http.POST, '/login', { password }))
      .then((data) => {
        authTokenFetched = data.token;
        this.setAuthToken(authTokenFetched);
        return authTokenFetched;
      })
      .then(function () {
        return authTokenFetched;
      });
  }

  getCaptainInfo() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/info', {}));
  }

  updateRootDomain(rootDomain: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/system/changerootdomain', {
          rootDomain,
        }),
      );
  }

  enableRootSsl(emailAddress: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/system/enablessl', {
          emailAddress,
        }),
      );
  }

  forceSsl(isEnabled: boolean) {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.POST, '/user/system/forcessl', { isEnabled }));
  }

  getAllApps() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/apps/appDefinitions', {}));
  }

  fetchBuildLogs(appName: string): Promise<IBuildLogs> {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/apps/appData/' + appName, {}));
  }

  uploadAppData(appName: string, file: ReadStream, gitHash: string) {
    const http = this.http;
    return Promise.resolve() //
      .then(
        http.fetch(
          http.POST_DATA,
          '/user/apps/appData/' + appName + '?detached=1',
          { sourceFile: file, gitHash },
        ),
      );
  }

  uploadCaptainDefinitionContent(
    appName: string,
    captainDefinition: ICaptainDefinition,
    gitHash: string,
    detached: boolean,
  ) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(
          http.POST,
          '/user/apps/appData/' + appName + (detached ? '?detached=1' : ''),
          {
            captainDefinitionContent: JSON.stringify(captainDefinition),
            gitHash,
          },
        ),
      );
  }

  updateConfigAndSave(appName: string, appDefinition: IAppDef) {
    const instanceCount = appDefinition.instanceCount;
    const envVars = appDefinition.envVars;
    const notExposeAsWebApp = appDefinition.notExposeAsWebApp;
    const forceSsl = appDefinition.forceSsl;
    const volumes = appDefinition.volumes;
    const ports = appDefinition.ports;
    const nodeId = appDefinition.nodeId;
    const appPushWebhook = appDefinition.appPushWebhook;
    const customNginxConfig = appDefinition.customNginxConfig;
    const preDeployFunction = appDefinition.preDeployFunction;
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/update', {
          appName,
          instanceCount,
          notExposeAsWebApp,
          forceSsl,
          volumes,
          ports,
          customNginxConfig,
          appPushWebhook,
          nodeId,
          preDeployFunction,
          envVars,
        }),
      );
  }

  registerNewApp(appName: string, hasPersistentData: boolean) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/register', {
          appName,
          hasPersistentData,
        }),
      );
  }

  deleteApp(appName: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/delete', {
          appName,
        }),
      );
  }

  enableSslForBaseDomain(appName: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/enablebasedomainssl', {
          appName,
        }),
      );
  }

  attachNewCustomDomainToApp(appName: string, customDomain: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/customdomain', {
          appName,
          customDomain,
        }),
      );
  }

  enableSslForCustomDomain(appName: string, customDomain: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(
          http.POST,
          '/user/apps/appDefinitions/enablecustomdomainssl',
          {
            appName,
            customDomain,
          },
        ),
      );
  }

  removeCustomDomain(appName: string, customDomain: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/removecustomdomain', {
          appName,
          customDomain,
        }),
      );
  }

  getLoadBalancerInfo() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/loadbalancerinfo', {}));
  }

  getNetDataInfo() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/netdata', {}));
  }

  updateNetDataInfo(netDataInfo: any) {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.POST, '/user/system/netdata', { netDataInfo }));
  }

  changePass(oldPassword: string, newPassword: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/changepassword', {
          oldPassword,
          newPassword,
        }),
      );
  }

  getVersionInfo(): Promise<IVersionInfo> {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/versioninfo', {}));
  }

  performUpdate(latestVersion: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/system/versioninfo', {
          latestVersion,
        }),
      );
  }

  getNginxConfig() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/nginxconfig', {}));
  }

  setNginxConfig(customBase: string, customCaptain: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/system/nginxconfig', {
          baseConfig: { customValue: customBase },
          captainConfig: { customValue: customCaptain },
        }),
      );
  }

  getUnusedImages(mostRecentLimit: number) {
    const http = this.http;
    return Promise.resolve() //
      .then(
        http.fetch(http.GET, '/user/apps/appDefinitions/unusedImages', {
          mostRecentLimit: mostRecentLimit + '',
        }),
      );
  }

  deleteImages(imageIds: string[]) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/apps/appDefinitions/deleteImages', {
          imageIds,
        }),
      );
  }

  getDockerRegistries() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/registries', {}));
  }

  enableSelfHostedDockerRegistry() {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(
          http.POST,
          '/user/system/selfhostregistry/enableregistry',
          {},
        ),
      );
  }

  disableSelfHostedDockerRegistry() {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(
          http.POST,
          '/user/system/selfhostregistry/disableregistry',
          {},
        ),
      );
  }

  addDockerRegistry(dockerRegistry: IRegistryInfo) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/registries/insert', {
          ...dockerRegistry,
        }),
      );
  }

  updateDockerRegistry(dockerRegistry: IRegistryInfo) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/registries/update', {
          ...dockerRegistry,
        }),
      );
  }

  deleteDockerRegistry(registryId: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/registries/delete', {
          registryId,
        }),
      );
  }

  setDefaultPushDockerRegistry(registryId: string) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/registries/setpush', {
          registryId,
        }),
      );
  }

  getAllNodes() {
    const http = this.http;

    return Promise.resolve() //
      .then(http.fetch(http.GET, '/user/system/nodes', {}));
  }

  addDockerNode(
    nodeType: string,
    privateKey: string,
    remoteNodeIpAddress: string,
    captainIpAddress: string,
  ) {
    const http = this.http;

    return Promise.resolve() //
      .then(
        http.fetch(http.POST, '/user/system/nodes', {
          nodeType,
          privateKey,
          remoteNodeIpAddress,
          captainIpAddress,
        }),
      );
  }
}
