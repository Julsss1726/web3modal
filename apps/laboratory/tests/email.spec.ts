import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { ModalWalletPage } from './shared/pages/ModalWalletPage'
import { Email } from './shared/utils/email'
import { ModalWalletValidator } from './shared/validators/ModalWalletValidator'
import { SECURE_WEBSITE_URL } from './shared/constants'

/* eslint-disable init-declarations */
let page: ModalWalletPage
let validator: ModalWalletValidator
let context: BrowserContext
let browserPage: Page
/* eslint-enable init-declarations */

// -- Setup --------------------------------------------------------------------
const emailTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

emailTest.describe.configure({ mode: 'serial' })

emailTest.beforeAll(async ({ browser, library }) => {
  emailTest.setTimeout(180000)
  context = await browser.newContext()
  browserPage = await context.newPage()

  page = new ModalWalletPage(browserPage, library, 'email')
  validator = new ModalWalletValidator(browserPage)

  await page.load()

  const mailsacApiKey = process.env['MAILSAC_API_KEY']
  if (!mailsacApiKey) {
    throw new Error('MAILSAC_API_KEY is not set')
  }
  const email = new Email(mailsacApiKey)
  const tempEmail = await email.getEmailAddressToUse()
  await page.emailFlow(tempEmail, context, mailsacApiKey)

  await validator.expectConnected()
})

emailTest.afterAll(async () => {
  await page.page.close()
})

// -- Tests --------------------------------------------------------------------
emailTest('it should sign', async () => {
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should upgrade wallet', async () => {
  const walletUpgradePage = await page.clickWalletUpgradeCard(context)
  expect(walletUpgradePage.url()).toContain(SECURE_WEBSITE_URL)
  await walletUpgradePage.close()
  await page.closeModal()
})

emailTest('it should reject sign', async () => {
  await page.sign()
  await page.rejectSign()
  await validator.expectRejectedSign()
})

emailTest('it should switch network and sign', async ({ library }) => {
  let targetChain = 'Polygon'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  if (library === 'wagmi') {
    // In wagmi, after switching network, it closes the modal
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()

  targetChain = 'Ethereum'
  await page.goToSettings()
  await page.switchNetwork(targetChain)
  if (library === 'wagmi') {
    // In wagmi, after switching network, it closes the modal
    await page.goToSettings()
  }
  await validator.expectSwitchedNetwork(targetChain)
  await page.closeModal()
  await page.sign()
  await page.approveSign()
  await validator.expectAcceptedSign()
})

emailTest('it should show loading on page refresh', async () => {
  await page.page.reload()
  await validator.expectConnectButtonLoading()
})

emailTest('it should disconnect correctly', async () => {
  await page.goToSettings()
  await page.disconnect()
  await validator.expectDisconnected()
})
