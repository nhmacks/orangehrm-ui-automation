@dashboard @smoke @regression
Feature: Dashboard Navigation
  As an authenticated user
  I want to navigate through different modules from the dashboard
  So that I can access various features of the system

  Background:
    Given I am logged in to OrangeHRM
    And I am on the dashboard page

  @navigation @dash001
  Scenario: Verify dashboard is loaded
    Then I should see the dashboard header "Dashboard"
    And I should see the side navigation menu
    And I should see the user dropdown

  @navigation @dash002
  Scenario Outline: Navigate to different modules
    When I click on the "<module>" menu item
    Then I should be redirected to the "<module>" page
    And the page URL should contain "<url_fragment>"

    Examples:
      | module      | url_fragment |
      | Admin       | admin        |
      | PIM         | pim          |
      | Leave       | leave        |
      | Time        | time         |
      | Recruitment | recruitment  |
      | My Info     | myinfo       |
      | Performance | performance  |

  @navigation @dash003
  Scenario: Navigate to Admin module
    When I navigate to "Admin" module
    Then I should see the Admin page loaded
    And I should see the admin header

  @navigation @dash004
  Scenario: Navigate to PIM module
    When I navigate to "PIM" module
    Then I should see the PIM page loaded
    And I should see employee management options

  @search @dash005
  Scenario: Search functionality from dashboard
    When I enter "Leave" in the search box
    And I press Enter
    Then I should see search results related to "Leave"

  @ui-validation @dash006
  Scenario: Verify dashboard widgets are displayed
    Then I should see dashboard widgets
    And the widget count should be greater than 0

  @profile @dash007
  Scenario: Verify user profile dropdown options
    When I click on user dropdown
    Then I should see the following options:
      | Change Password |
      | About           |
      | Support         |
      | Logout          |

  @breadcrumb @dash008
  Scenario: Verify breadcrumb navigation
    When I navigate to "Admin" module
    And I navigate to a sub-section
    Then I should see the breadcrumb trail
    And I should be able to navigate back using breadcrumbs

  @responsive @dash009
  Scenario: Dashboard responsive behavior
    When I resize the browser window to mobile size
    Then the side menu should collapse
    And the mobile menu icon should appear

  @quick-launch @dash010
  Scenario: Quick launch from dashboard
    When I click on a quick launch item
    Then I should be redirected to the corresponding module
    And the module page should load successfully