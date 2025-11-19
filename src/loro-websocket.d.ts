declare module "loro-websocket" {
  import { CrdtType } from "loro-protocol";
  import { CrdtDocAdaptor } from "loro-adaptors";
  export * from "loro-adaptors";

  //#region src/client/index.d.ts

  /**
   * The websocket client's high-level connection status.
   * - `Connecting`: initial connect or a manual `connect()` in progress.
   * - `Connected`: the websocket is open and usable.
   * - `Disconnected`: the client is not connected. Call `connect()` to retry.
   */
  declare const ClientStatus: {
    readonly Connecting: "connecting";
    readonly Connected: "connected";
    readonly Disconnected: "disconnected";
  };
  type ClientStatusValue = (typeof ClientStatus)[keyof typeof ClientStatus];
  /**
   * Options for `LoroWebsocketClient`.
   *
   * Behavior summary:
   * - The client auto-connects on construction and retries on unexpected closures with an exponential backoff.
   * - Call `close()` to stop auto-reconnect and move to `Disconnected`. Call `connect()` to resume.
   * - Pings are sent periodically to keep the connection alive; `latency` estimates are updated on pong.
   */
  interface LoroWebsocketClientOptions {
    /** WebSocket URL (ws:// or wss://). */
    url: string;
    /** Optional custom ping interval. Defaults to 30s. Set with `disablePing` to stop timers. */
    pingIntervalMs?: number;
    /** Disable periodic ping/pong entirely. */
    disablePing?: boolean;
    /** Optional callback for low-level ws close (before status transitions). */
    onWsClose?: () => void;
  }
  /**
   * Loro websocket client with auto-reconnect, connection status events, and latency tracking.
   *
   * Status model:
   * - `Connected`: ws open.
   * - `Disconnected`: socket closed. Auto-reconnect retries run unless `close()`/`destroy()` stop them.
   * - `Connecting`: initial or manual connect in progress.
   *
   * Events:
   * - `onStatusChange(cb)`: called whenever status changes.
   * - `onLatency(cb)`: called when a new RTT estimate is measured from ping/pong.
   */
  declare class LoroWebsocketClient {
    private ops;
    private ws;
    private connectedPromise;
    private resolveConnected?;
    private rejectConnected?;
    private status;
    private statusListeners;
    private latencyListeners;
    private lastLatencyMs?;
    private awaitingPongSince?;
    private pendingRooms;
    private activeRooms;
    private preJoinUpdates;
    private fragmentBatches;
    private roomAdaptors;
    private roomIds;
    private roomAuth;
    private socketListeners;
    private pingTimer?;
    private pingWaiters;
    private shouldReconnect;
    private reconnectAttempts;
    private reconnectTimer?;
    private removeNetworkListeners?;
    constructor(ops: LoroWebsocketClientOptions);
    private ensureConnectedPromise;
    private attachNetworkListeners;
    /** Current client status. */
    getStatus(): ClientStatusValue;
    /** Latest measured RTT in ms (if any). */
    getLatency(): number | undefined;
    /** Subscribe to status changes. Returns an unsubscribe function. */
    onStatusChange(cb: (s: ClientStatusValue) => void): () => void;
    /** Subscribe to latency updates (RTT via ping/pong). Returns an unsubscribe function. */
    onLatency(cb: (ms: number) => void): () => void;
    private setStatus;
    /** Initiate or resume connection. Resolves when `Connected`. */
    connect(): Promise<void>;
    private attachSocketListeners;
    private onSocketOpen;
    private onSocketError;
    private onSocketClose;
    private onSocketMessage;
    private scheduleReconnect;
    private clearReconnectTimer;
    private handleOnline;
    private handleOffline;
    private rejoinActiveRooms;
    private handleMessage;
    private handleFragmentHeader;
    private handleFragment;
    private registerActiveRoom;
    private handleJoinError;
    cleanupRoom(roomId: string, crdtType: CrdtType): void;
    waitConnected(): Promise<void>;
    ping(timeoutMs?: number): Promise<void>;
    join({
      roomId,
      crdtAdaptor,
      auth,
    }: {
      roomId: string;
      crdtAdaptor: CrdtDocAdaptor;
      auth?: Uint8Array;
    }): Promise<LoroWebsocketClientRoom>;
    /**
     * Manually close the connection and stop auto-reconnect.
     * To reconnect later, call `connect()`.
     */
    close(): void;
    private sendUpdateOrFragments;
    /** @internal Send Leave on the current websocket. */
    sendLeave(crdt: CrdtType, roomId: string): void;
    /**
     * Destroy the client, removing listeners and stopping timers.
     * After destroy, the instance should not be used.
     */
    destroy(): void;
    private flushAndCloseWebSocket;
    private detachSocketListeners;
    private startPingTimer;
    private clearPingTimer;
    private handlePong;
    private rejectAllPingWaiters;
  }
  interface LoroWebsocketClientRoom {
    /**
     * Leave the room.
     */
    leave(): Promise<void>;
    /**
     * This method returns a promise that resolves when the client document version is >= the server's version.
     */
    waitForReachingServerVersion(): Promise<void>;
    destroy(): Promise<void>;
  }
  //#endregion
  export {
    ClientStatus,
    ClientStatusValue,
    LoroWebsocketClient,
    LoroWebsocketClientOptions,
    LoroWebsocketClientRoom,
  };
  //# sourceMappingURL=index-Blci25_L.d.ts.map
}
