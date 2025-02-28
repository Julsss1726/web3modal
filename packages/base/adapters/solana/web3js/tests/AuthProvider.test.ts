import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockW3mFrameProvider } from './mocks/W3mFrameProvider'
import { AuthProvider } from '../providers/AuthProvider'
import { TestConstants } from './util/TestConstants'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction'
import type { SocialProvider } from '@web3modal/scaffold-utils'

describe('AuthProvider specific tests', () => {
  let provider = mockW3mFrameProvider()
  let getActiveChain = vi.fn(() => TestConstants.chains[0])
  let auth = {
    email: true,
    socials: [
      'google',
      'x',
      'discord',
      'farcaster',
      'github',
      'apple',
      'facebook'
    ] as SocialProvider[]
  }
  let authProvider = new AuthProvider({
    auth,
    provider,
    chains: TestConstants.chains,
    getActiveChain
  })

  beforeEach(() => {
    provider = mockW3mFrameProvider()
    getActiveChain = vi.fn(() => TestConstants.chains[0])
    auth = {
      email: true,
      socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook']
    }
    authProvider = new AuthProvider({
      auth,
      provider,
      chains: TestConstants.chains,
      getActiveChain
    })
  })

  it('should call connect', async () => {
    await authProvider.connect()

    expect(provider.connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await authProvider.disconnect()

    expect(provider.disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    await authProvider.connect()
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await authProvider.signMessage(message)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signMessage',
      params: {
        message: '7bWpTW',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })

  it('should call signTransaction with correct params', async () => {
    await authProvider.connect()
    const transaction = mockLegacyTransaction()
    await authProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq'
      }
    })
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    await authProvider.connect()
    const transaction = mockVersionedTransaction()
    await authProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          '48ckoQL1HhH5aqU1ifKqpQkwq3WPDgMnsHHQkVfddisxYcapwAVXr8hejTi2jeJpMPkZMsF72SwmJFDByyfRtaknz4ytCYNAcdHrxtrHa9hTjMKckVQrFFqS8zG63Wj5mJ6wPfj8dv1wKu2XkU6GSXSGdQmuvfRv3K6LUSMbK5XSP3yBGb1SDZKCuoFX4qDKcKhCG7Awn3ssAWB1yRaXMd6mS6HQHKSF11FTp3jTH2HKUNbKyyuGh4tYtq8b'
      }
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    await authProvider.connect()
    const transaction = mockLegacyTransaction()

    await authProvider.signAndSendTransaction(transaction)
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        options: undefined
      }
    })

    await authProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip'
    })
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        options: { preflightCommitment: 'singleGossip' }
      }
    })
  })

  it('should call switch network with correct params and emit event', async () => {
    await authProvider.connect()
    const newChain = TestConstants.chains[1]!
    const listener = vi.fn()

    authProvider.on('chainChanged', listener)
    await authProvider.switchNetwork(newChain.chainId)

    expect(provider.switchNetwork).toHaveBeenCalledWith(newChain.chainId)
    expect(listener).toHaveBeenCalledWith(newChain.chainId)
  })
})
