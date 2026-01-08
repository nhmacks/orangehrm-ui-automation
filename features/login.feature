@smoke @login @regression
Feature: User Authentication
  As a user of OrangeHRM
  I want to be able to login to the system
  So that I can access my account and perform various tasks

  Background:
    Given I am on the OrangeHRM login page

  @positive @lg001
  Scenario: Successful login with valid credentials
    When I enter username "Admin"
    And I enter password "admin123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see the dashboard header

  @negative @lg002
  Scenario: empty username and password
    When I enter username ""
    And I enter password ""
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled or show error

  @negative @lg003
  Scenario: Empty username
    When I enter username ""
    And I enter password "admin123"
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled or show error

  @negative @lg004
  Scenario: Empty password
    When I enter username "Admin"
    And I enter password ""
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled or show error


  @negative @lg005
  Scenario: Failed login with invalid username
    When I enter username "InvalidUser"
    And I enter password "admin123"
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

  @negative @lg006
  Scenario: Failed login with invalid password
    When I enter username "Admin"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @negative
  Scenario: user and password invalid
    When I enter username "user1"
    And I enter password "pass1"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @negative @lg007
  Scenario: Failed login with empty credentials
    When I click the login button
    Then I should see validation errors
    And the login button should be disabled or show error

  @lg008 @ui-validation
  Scenario: Verify login page elements
    Then I should see the username input field
    And I should see the password input field
    And I should see the login button
    And I should see the forgot password link
    And I should see the company logo

  @functional
  Scenario: Logout functionality
    When I login with default credentials
    Then I should be redirected to the dashboard
    When I click on user dropdown
    And I click logout
    Then I should be redirected to the login page
    And I should see the login form

  @security
  Scenario: Password field should mask input
    When I enter password "SecurePassword123"
    Then the password field should be masked
    And the password should not be visible

  @smoke
  Scenario: Quick login with default credentials
    When I login with default credentials
    Then I should be logged in successfully
    And I should see the user dropdown in the header