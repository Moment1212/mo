import type { Json } from '@metamask/utils';
import { assert } from 'superstruct';
import { v4 as uuid } from 'uuid';

import {
  Keyring,
  KeyringAccount,
  KeyringRequest,
  SubmitRequestResponse,
  SubmitRequestResponseStruct,
} from './keyring-api';
import {
  ApproveRequestResponseStruct,
  CreateAccountResponseStruct,
  DeleteAccountResponseStruct,
  FilterAccountChainsResponseStruct,
  GetAccountResponseStruct,
  GetRequestResponseStruct,
  InternalRequest,
  InternalResponse,
  ListAccountsResponseStruct,
  ListRequestsResponseStruct,
  RejectRequestResponseStruct,
  UpdateAccountResponseStruct,
} from './keyring-internal-api';
import { OmitUnion, strictMask } from './utils';

export type Sender = {
  send(request: InternalRequest): Promise<InternalResponse>;
};

export class KeyringClient implements Keyring {
  #sender: Sender;

  /**
   * Create a new instance of `KeyringClient`.
   *
   * @param sender - The `Sender` instance to use to send requests to the snap.
   */
  constructor(sender: Sender) {
    this.#sender = sender;
  }

  /**
   * Send a request to the snap and return the response.
   *
   * @param partial - Partial internal request (method and params).
   * @returns A promise that resolves to the response to the request.
   */
  async #send(
    partial: OmitUnion<InternalRequest, 'jsonrpc' | 'id'>,
  ): Promise<InternalResponse> {
    return await this.#sender.send({
      jsonrpc: '2.0',
      id: uuid(),
      ...partial,
    });
  }

  async listAccounts(): Promise<KeyringAccount[]> {
    return strictMask(
      await this.#send({
        method: 'keyring_listAccounts',
      }),
      ListAccountsResponseStruct,
    );
  }

  async getAccount(id: string): Promise<KeyringAccount> {
    return strictMask(
      await this.#send({
        method: 'keyring_getAccount',
        params: { id },
      }),
      GetAccountResponseStruct,
    );
  }

  async createAccount(
    name: string,
    options: Record<string, Json> | null = null,
  ): Promise<KeyringAccount> {
    return strictMask(
      await this.#send({
        method: 'keyring_createAccount',
        params: { name, options },
      }),
      CreateAccountResponseStruct,
    );
  }

  async filterAccountChains(id: string, chains: string[]): Promise<string[]> {
    return strictMask(
      await this.#send({
        method: 'keyring_filterAccountChains',
        params: { id, chains },
      }),
      FilterAccountChainsResponseStruct,
    );
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    assert(
      await this.#send({
        method: 'keyring_updateAccount',
        params: { account },
      }),
      UpdateAccountResponseStruct,
    );
  }

  async deleteAccount(id: string): Promise<void> {
    assert(
      await this.#send({
        method: 'keyring_deleteAccount',
        params: { id },
      }),
      DeleteAccountResponseStruct,
    );
  }

  async listRequests(): Promise<KeyringRequest[]> {
    return strictMask(
      await this.#send({
        method: 'keyring_listRequests',
      }),
      ListRequestsResponseStruct,
    );
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    return strictMask(
      await this.#send({
        method: 'keyring_getRequest',
        params: { id },
      }),
      GetRequestResponseStruct,
    );
  }

  async submitRequest(request: KeyringRequest): Promise<SubmitRequestResponse> {
    return strictMask(
      await this.#send({
        method: 'keyring_submitRequest',
        params: request,
      }),
      SubmitRequestResponseStruct,
    );
  }

  async approveRequest(id: string): Promise<void> {
    assert(
      await this.#send({
        method: 'keyring_approveRequest',
        params: { id },
      }),
      ApproveRequestResponseStruct,
    );
  }

  async rejectRequest(id: string): Promise<void> {
    assert(
      await this.#send({
        method: 'keyring_rejectRequest',
        params: { id },
      }),
      RejectRequestResponseStruct,
    );
  }
}
