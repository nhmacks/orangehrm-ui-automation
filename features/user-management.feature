@smoke @user-management @regression
Feature: User Management
    As an admin user
    I want to manage system users
    So that I can control user access and permissions

    Background:
        Given I am on the OrangeHRM login page
        When I login with default credentials
        Then I should be redirected to the dashboard

    @um001 @filters @positive
    Scenario: Filter users by username
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter username "Admin" in the username filter
        And I click the search button
        Then I should see users matching the username "Admin"
        And the results should be filtered correctly

    @um002 @filters @positive
    Scenario: Filter users by user role
        Given I navigate to the Admin module
        And I am on the System Users page
        When I select "Admin" from the user role dropdown
        And I click the search button
        Then I should see only users with "Admin" role
        And the results should display the correct role

    @um003 @filters @positive
    Scenario: Filter users by employee name
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter employee name "Paul" in the employee name filter
        And I click the search button
        Then I should see users with employee name containing "Paul"

    @um004 @filters @positive
    Scenario: Filter users by status
        Given I navigate to the Admin module
        And I am on the System Users page
        When I select "Enabled" from the status dropdown
        And I click the search button
        Then I should see only users with "Enabled" status
        And all displayed users should have enabled status

    @um005 @filters @positive
    Scenario: Filter users with multiple criteria
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter username "Admin" in the username filter
        And I select "Admin" from the user role dropdown
        And I select "Enabled" from the status dropdown
        And I click the search button
        Then I should see users matching all filter criteria
        And the results count should be greater than 0

    @um006 @filters @negative
    Scenario: Filter users with non-existent username
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter username "NonExistentUser123" in the username filter
        And I click the search button
        Then I should see no records found message
        And the results table should be empty

    @um007 @filters @functional
    Scenario: Reset filters to show all users
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter username "Admin" in the username filter
        And I click the search button
        And I see filtered results
        When I click the reset button
        Then all filter fields should be cleared
        And I should see all users in the system

    @um008 @ui-validation
    Scenario: Verify filter fields are displayed
        Given I navigate to the Admin module
        And I am on the System Users page
        Then I should see the username filter field
        And I should see the user role dropdown
        And I should see the employee name filter field
        And I should see the status dropdown
        And I should see the search button
        And I should see the reset button

    @um009 @filters @actions @positive
    Scenario: Verify edit and delete action buttons for Admin users
        Given I navigate to the Admin module
        And I am on the System Users page
        When I select "Admin" from the user role dropdown
        And I click the search button
        Then I should see only users with "Admin" role
        And each user record should have an edit action button
        And each user record should have a delete action button
        And the action buttons should be visible

    @um010 @user-creation @positive
    Scenario: Create new admin user successfully
        Given I navigate to the Admin module
        And I am on the System Users page
        When I click the Add button
        Then I should be on the Add User page
        When I select "Admin" from the User Role dropdown in Add User form
        And I enter "John" in employee name autocomplete
        And I select "John  Doe" from employee suggestions
        And I select "Enabled" from the Status dropdown in Add User form
        And I enter "HappyTesting" in the username field
        And I enter "HappyTesting123" in the password field
        And I enter "HappyTesting123" in the confirm password field
        And I click the Save button
        Then I should see a success message
        And I should be redirected to System Users page

    @um011 @user-creation @validation
    Scenario: Verify newly created user exists in system
        Given I navigate to the Admin module
        And I am on the System Users page
        When I enter username "HappyTesting" in the username filter
        And I click the search button
        Then I should see users matching the username "HappyTesting"
        And the user should have "Admin" role
        And the user should have "Enabled" status

    @um012 @ui-validation @user-creation
    Scenario: Verify Add User form fields are present and functional
        Given I navigate to the Admin module
        And I am on the System Users page
        When I click the Add button
        Then I should be on the Add User page
        And I should see the User Role dropdown field
        And I should see the Employee Name autocomplete field
        And I should see the Status dropdown field
        And I should see the Username text field
        And I should see the Password text field
        And I should see the Confirm Password text field
        And I should see the Save button in form
        And I should see the Cancel button in form
