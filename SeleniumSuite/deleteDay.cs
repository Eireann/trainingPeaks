using System;
using System.Text;
using System.Threading;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;

using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Remote;

namespace SeleniumSuite
{
    [TestFixture]
    public class DeleteDay
    {
        private IWebDriver driver;
        private StringBuilder verificationErrors;
        private string baseURL;
        private bool acceptNextAlert = true;

        [SetUp]
        public void SetupTest()
        {
            verificationErrors = new StringBuilder();

            baseURL = "http://127.0.0.1:8080/";

            DesiredCapabilities capabilities = DesiredCapabilities.Chrome();
            capabilities.SetCapability(CapabilityType.Platform, new Platform(PlatformType.Vista));
            capabilities.SetCapability("name", "Day Delete Test");
            capabilities.SetCapability("username", "bfanti");
            capabilities.SetCapability("accessKey", "64242fe5-bfe4-4a00-adbe-22ca5207ae62");

            driver = new RemoteWebDriver(new Uri("http://ondemand.saucelabs.com:80/wd/hub"), capabilities);
        }

        [TearDown]
        public void TeardownTest()
        {
            try
            {
                driver.Quit();
            }
            catch (Exception)
            {
                // Ignore errors if unable to close the browser
            }
            Assert.AreEqual("", verificationErrors.ToString());
        }

        [Test]
        public void TheDeleteDayTest()
        {
            driver.Navigate().GoToUrl(baseURL);

            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (IsElementPresent(By.CssSelector("input#username"))) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }

            var usernameInput = driver.FindElement(By.CssSelector("input#username"));
            var passwordInput = driver.FindElement(By.CssSelector("input#password"));
            var loginButton = driver.FindElement(By.CssSelector("input[name='Submit']"));

            usernameInput.Click();
            usernameInput.SendKeys("barbkprem");

            passwordInput.Click();
            passwordInput.SendKeys("password");

            loginButton.Click();

            // *** this script requires workouts to be present on the day
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (IsElementPresent(By.CssSelector("div#weeksContainer"))) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }

            driver.Manage().Timeouts().ImplicitlyWait(new TimeSpan(0, 0, 10));

            // hovers over day so CRUD menu appears, click Delete
            // ERROR: Caught exception [ERROR: Unsupported command [mouseOver | css= div.today.day.ui-droppable | ]]
            var dayCrudHover = driver.FindElement(By.CssSelector("div.today.day.ui-droppable"));
            Actions builder = new Actions(driver);
            Actions hoverOverCrud = builder.MoveToElement(dayCrudHover);
            hoverOverCrud.Perform();

            driver.FindElement(By.CssSelector("div.day.today div.daySettings")).Click();
            driver.FindElement(By.Id("calendarDaySettingsDeleteLabel")).Click();
            // **DELETE CONFIRMATION - NO
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (IsElementPresent(By.Id("deleteConfirmationCancel"))) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }
            driver.FindElement(By.Id("deleteConfirmationCancel")).Click();
            Assert.IsTrue(IsElementPresent(By.CssSelector("div.today.day div.workout")));
            // **DELETE CONFIRMATION - YES
            // ERROR: Caught exception [ERROR: Unsupported command [mouseOver | css= div.today.day.ui-droppable | ]]
            driver.FindElement(By.CssSelector("div.day.today div.daySettings")).Click();
            driver.FindElement(By.Id("calendarDaySettingsDeleteLabel")).Click();
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (IsElementPresent(By.Id("deleteConfirmationDelete"))) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }
            driver.FindElement(By.Id("deleteConfirmationDelete")).Click();
            // makes sure day is empty
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (!IsElementPresent(By.CssSelector("div.day.today div.workout"))) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }
        }
        private bool IsElementPresent(By by)
        {
            try
            {
                driver.FindElement(by);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        private string CloseAlertAndGetItsText()
        {
            try
            {
                IAlert alert = driver.SwitchTo().Alert();
                if (acceptNextAlert)
                {
                    alert.Accept();
                }
                else
                {
                    alert.Dismiss();
                }
                return alert.Text;
            }
            finally
            {
                acceptNextAlert = true;
            }
        }
    }
}
