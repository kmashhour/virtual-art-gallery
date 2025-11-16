### PBI: Design ERD  
**Epic:** Setup

**Description:**  
Identify all required entities (such as collections, collection–artworks links, favorites, and comments), define their relationships and cardinalities, and produce a complete ERD diagram to be used as the foundation for the database design.

**Acceptance Criteria:**
- [ ] ERD includes all key entities (collections, artworks link, favorites, comments).  
- [ ] ERD shows relationships and cardinalities.  
- [ ] ERD is stored and shared (image, PDF, or link).


---

### PBI: Create Database Schema  
**Epic:** Setup

**Description:**  
Translate the ERD into SQLite table structures, define all fields and keys, and prepare a schema script or migration plan that creates the required tables.

**Acceptance Criteria:**
- [ ] Database schema matches the ERD.  
- [ ] All entities have tables with appropriate fields and keys.  
- [ ] Schema is available as SQL script or migration design.


---

### PBI: Prepare Test Dataset  
**Epic:** Setup

**Description:**  
Select a representative set of MET object IDs and create test records for collections, artwork links, favorites, and comments. Include both typical and edge-case data, and document how to re-create the dataset.

**Acceptance Criteria:**
- [ ] Test dataset includes sample collections, MET artwork links, favorites, and comments.  
- [ ] Dataset includes both typical and edge cases (empty collection, multiple artworks, etc.).  
- [ ] Dataset is documented for re-creation.


---

### PBI: Design UX Wireframes  
**Epic:** UX

**Description:**  
Create low-fidelity wireframes for all public pages (collections overview, artworks per collection, artwork detail, favorites) and admin pages (collection list, create/edit collection, add/remove artworks). Wireframes must show layout, navigation elements, and core interactions.

**Acceptance Criteria:**
- [ ] Wireframes exist for main public pages: collections overview, artworks in collection, artwork detail, favorites.  
- [ ] Wireframes exist for main admin pages: admin collections list, create/edit collection, add/remove artworks.  
- [ ] Wireframes show layout, navigation, and core interactions.


---

### PBI: Define Sitemap & Navigation  
**Epic:** UX

**Description:**  
Create a clear sitemap showing all public and admin pages, define how users and admins navigate between them, and align the structure with the planned React routing setup.

**Acceptance Criteria:**
- [ ] Sitemap lists all public and admin pages.  
- [ ] Navigation flow between pages is clearly defined.  
- [ ] Sitemap aligns with planned React routes.

##

🧠 Important tip

Your React URLs (like /login, /dashboard) should be handled by React Router — not the backend.
Your API URLs (like /api/login, /api/products) are handled by the backend.

Many devs prefix all backend routes with /api so the split is clear.

##

---

### PBI: UX Heuristic Evaluation of the Art Gallery  
**Epic:** UX  

**Description:**  
Perform a heuristic evaluation of the first working version of the Art Gallery using Nielsen & Molich’s usability heuristics. Identify UX problems, rate their severity, and propose improvements.

**Acceptance Criteria:**  
- [ ] UX issues are documented.  
- [ ] Issues are categorized by severity.  
- [ ] Recommendations are written for each issue.  
- [ ] Evaluation covers main pages (overview, detail, favorites, admin).  


---

### PBI: Usability Test of First Prototype  
**Epic:** UX Testing  

**Description:**  
Conduct a usability test with at least two participants using think-aloud or task-based testing. Collect observations, errors, and user experience notes.

**Acceptance Criteria:**  
- [ ] Two users complete the assigned tasks.  
- [ ] Observations during tasks are documented.  
- [ ] Task success and errors are recorded.  
- [ ] A summary of test results is created.  


---

### PBI: Analyze Usability Test Results  
**Epic:** UX Testing  

**Description:**  
Analyze usability test results and identify improvements for the next sprint. Summarize issues, findings, and recommended changes.

**Acceptance Criteria:**  
- [ ] Test data is analyzed and summarized.  
- [ ] Key usability problems are identified.  
- [ ] Suggested improvements are documented.  
- [ ] A short improvement plan is created.  


---

### PBI: Retrospective & Reflection (Sprint Review)  
**Epic:** Project Management  

**Description:**  
Reflect on the sprint as a team. Document what went well, what can be improved, and actionable points for the next sprint.

**Acceptance Criteria:**  
- [ ] “Went well” points are documented.  
- [ ] “To improve” points are documented.  
- [ ] Actionable next steps are defined.  
- [ ] Reflection is shared with the team.  


---

### PBI: Technical Documentation  
**Epic:** Documentation  

**Description:**  
Document the technical structure of the application including the API, architecture, data model, and key implementation decisions.

**Acceptance Criteria:**  
- [ ] API endpoints are documented.  
- [ ] Architecture decisions are described.  
- [ ] Data model / ERD explanation is included.  
- [ ] Documentation is accessible to all team members.  


---

### PBI: Final Presentation Preparation  
**Epic:** Documentation  

**Description:**  
Prepare the final presentation including slides, demo script, and explanation of design and development decisions.

**Acceptance Criteria:**  
- [ ] Presentation slides are created.  
- [ ] Demo script is written.  
- [ ] Technical and design choices are included.  
- [ ] Team members know their speaking roles.  



---

## User-facing PBIs (with User Stories)


### PBI: View Collections Overview
**Epic:** Gallery

**User Story:**
- **As a** user
- **I want to** see an overview of available art collections
- **so** that I can choose which curated collection I want to browse.

##

### API:
**Endpoint:** `GET /api/collections?published=true`

##

**Description:**  
Create an endpoint that returns all published collections with basic details such as name, description, cover image, and category.

##

**Acceptance Criteria:**
- [ ] Given: the user opens the homepage / collections page  
- [ ] When: the collections have been loaded  
- [ ] Then: the user sees a list/grid of available collections  
- [ ] And: each collection shows at least name, description, and cover image  
- [ ] And: if there are no published collections, a clear message is shown  
- [ ] And: no error message is visible unless the data could not be loaded.

**Subtasks:**
- **API – View Collections**  
  Endpoint: `GET /api/collections?published=true`  
  Description: Create an API that returns all published collections with their basic details.

- **UI – Collections Overview Page**  
  Description: Create a React page that loads collections from the API and displays them in a grid or list.


---

### PBI: View Artwork (Overview) in a Collection
**Epic:** Gallery

**User Story:**
- **As a** user
- **I want to** see an overview of artworks (image, title, artist) within a selected collection
- **so** that I can browse the curated artworks chosen by the admin.

##

### API:
**Endpoint:** `GET /api/collections/:collectionId/artworks`

##

**Description:**  
Create an endpoint that returns all artworks linked to a collection by reading their MET object IDs from the database and retrieving details from the MET API.

##

**Acceptance Criteria:**
- [ ] Given: the user has selected a published collection  
- [ ] When: the artworks for that collection have been loaded  
- [ ] Then: the user sees a grid/list of artworks from that collection  
- [ ] And: each item shows at least image, title, artist  
- [ ] And: if the collection has no artworks, a clear message is shown  
- [ ] And: no error message is visible unless the data could not be loaded.

**Subtasks:**
- **API – Collection Artworks**  
  Endpoint: `GET /api/collections/:collectionId/artworks`  
  Description: Create an API that returns all artworks for a given collection using MET object IDs.

- **UI – Artworks in Collection**  
  Description: Create a React page that shows all artworks for a selected collection in a grid or list.


---

### PBI: View Artwork Details
**Epic:** Gallery

**User Story:**
- **As a** user
- **I want to** see details of a single artwork
- **so** that I can get more background information.

##

### API:
**Endpoint:** `GET /api/artworks/:metObjectId`

##

**Description:**  
Create an endpoint that retrieves detailed artwork data from the MET API including title, artist, date, technique, and full-size images.

##

**Acceptance Criteria:**
- [ ] Given: a user clicks on an artwork in a collection overview  
- [ ] When: the detail page loads  
- [ ] Then: the user sees: title, artist, image, description, year, technique  
- [ ] And: the user sees a “Favorite” button (or icon)  
- [ ] And: the user sees a comments section (if any exist).

**Subtasks:**
- **API – Artwork Details**  
  Endpoint: `GET /api/artworks/:metObjectId`  
  Description: Create an API that returns detailed information for a single artwork from the MET API.

- **UI – Artwork Detail Page**  
  Description: Create a React page that displays one artwork with image, metadata, favorite button, and comment section.


---

### PBI: Search by Title (within a Collection)
**Epic:** Search

**User Story:**
- **As a** user
- **I want to** search artworks by title within the current collection
- **so** that I can find a specific artwork inside that curated selection.

##

### API:
**Endpoint:** `GET /api/collections/:collectionId/search?title=...`

##

**Description:**  
Create an endpoint that searches artworks in a collection by filtering the collection’s MET artwork IDs based on title metadata.

##

**Acceptance Criteria:**
- [ ] Given: the user is on a collection page  
- [ ] When: the user enters a search term in the search bar  
- [ ] Then: only artworks in that collection whose title matches the search term are shown  
- [ ] And: if the search term is empty, all artworks reappear  
- [ ] And: if no results are found, a clear message is displayed.

**Subtasks:**
- **API – Title Search in Collection**  
  Endpoint: `GET /api/collections/:collectionId/search?title=`  
  Description: Create an API that returns artworks in a collection filtered by title.

- **UI – Title Search UI**  
  Description: Add a search field on the collection page that filters artworks by title using the search API.


---

### PBI: Search by Artist (within a Collection)
**Epic:** Search

**User Story:**
- **As a** user
- **I want to** search artworks by artist within the current collection
- **so** that I can find works by a specific creator in that collection.

##

### API:
**Endpoint:** `GET /api/collections/:collectionId/search?artist=...`

##

**Description:**  
Create an endpoint that searches artworks in a collection by filtering the collection’s MET artwork IDs based on artist metadata.

##

**Acceptance Criteria:**
- [ ] Given: the user opens a collection page  
- [ ] When: the user types the name of an artist  
- [ ] Then: only artworks by that artist within that collection appear  
- [ ] And: if no artworks are found, the user receives a message.

**Subtasks:**
- **API – Artist Search in Collection**  
  Endpoint: `GET /api/collections/:collectionId/search?artist=`  
  Description: Create an API that returns artworks in a collection filtered by artist name.

- **UI – Artist Search UI**  
  Description: Add a search option on the collection page that filters artworks by artist using the search API.


---

### PBI: Mark Artwork as Favorite
**Epic:** Favorites

**User Story:**
- **As a** user
- **I want to** mark an artwork as a favorite
- **so** that I can save my personal selection.

##

### API:
**Endpoint:** `POST /api/favorites`, `DELETE /api/favorites/:metObjectId`

##

**Description:**  
Create endpoints that allow adding or removing favorite artworks by storing their MET object IDs in the SQLite database.

##

**Acceptance Criteria:**
- [ ] Given: the user is on a detail page  
- [ ] When: the user clicks the favorite button  
- [ ] Then: the artwork is added to the favorites list  
- [ ] And: the icon visually changes  
- [ ] And: clicking again removes the artwork from favorites.

**Subtasks:**
- **API – Favorite Artwork**  
  Endpoint: 
  - `POST /api/favorites`
  - `DELETE /api/favorites/:metObjectId`  

  Description: Create APIs that add and remove favorite artworks based on MET object IDs.

- **UI – Favorite Button**  
  Description: Add a favorite toggle button to the artwork detail page that uses the favorite APIs.


---

### PBI: View Favorites Page
**Epic:** Favorites

**User Story:**
- **As a** user
- **I want to** view my favorites in a separate section
- **so** that I can quickly find them again.

##

### API:
**Endpoint:** `GET /api/favorites`

##

**Description:**  
Create an endpoint that retrieves all favorited artwork IDs from SQLite, which can then be resolved into full artwork data.

##

**Acceptance Criteria:**
- [ ] Given: the user navigates to “Favorites”  
- [ ] When: the page loads  
- [ ] Then: they see all marked artworks  
- [ ] And: each artwork shows at least image + title  
- [ ] And: if there are no favorites, a message is shown.

**Subtasks:**
- **API – Get Favorites**  
  Endpoint: `GET /api/favorites`  
  Description: Create an API that returns a list of all favorite MET object IDs (and optional basic info).

- **UI – Favorites Page**  
  Description: Create a React page that loads and displays all favorites from the favorites API.


---

### PBI: Persist Favorites (Stored Between Sessions)
**Epic:** Favorites

**User Story:**
- **As a** user
- **I want to** have my favorites saved
- **so** that I can see them again later.

### API:
**Endpoint:**  
- `POST /api/favorites`  
- `DELETE /api/favorites/:metObjectId`  
- `GET /api/favorites`

##

**Description:**  
Create persistent storage for favorites by keeping favorite records in SQLite instead of local memory.

##

**Acceptance Criteria:**
- [ ] Given: the user closes the website  
- [ ] When: they return later  
- [ ] Then: their favorites remain available.

##

**Subtasks:**
- **API – Favorites Persistence**  
  Description: Use the existing endpoints (`POST`, `DELETE`, `GET /api/favorites`) and ensure they always read from and write to SQLite so data survives restarts.

- **UI – Favorites State Sync**  
  Description: Ensure the frontend loads favorites from `GET /api/favorites` on startup so the UI matches the stored favorites.



---

### PBI: Add Comments
**Epic:** Comments

**User Story:**
- **As a** user
- **I want to** leave comments on an artwork
- **so** that I can save my opinions or notes.

##

### API:
**Endpoint:** `POST /api/comments/:metObjectId`

##

**Description:**  
Create an endpoint that stores comments for artworks in SQLite, linked by MET object ID.

##

**Acceptance Criteria:**
- [ ] Given: the user is on the detail page  
- [ ] When: the user enters a comment and clicks “Submit”  
- [ ] Then: the comment is stored  
- [ ] And: it immediately appears under the artwork  
- [ ] And: the input field resets.

**Subtasks:**
- **API – Add Comment**  
  Endpoint: `POST /api/comments/:metObjectId`  
  Description: Create an API that saves a new comment for a given artwork.

- **UI – Comment Form**  
  Description: Add a comment form to the artwork detail page that sends new comments to the API and updates the list.


---

### PBI: View Comments
**Epic:** Comments

**User Story:**
- **As a** user
- **I want to** view comments on an artwork
- **so** that I can see what others think.

##

### API:
**Endpoint:** `GET /api/comments/:metObjectId`

##

**Description:**  
Create an endpoint that retrieves all comments linked to a specific MET object ID from SQLite.

##

**Acceptance Criteria:**
- [ ] Given: the detail page loads  
- [ ] When: comments exist  
- [ ] Then: the user sees a list of comments  
- [ ] And: each comment shows text and timestamp  
- [ ] And: if no comments exist, this is indicated.

**Subtasks:**
- **API – Get Comments**  
  Endpoint: `GET /api/comments/:metObjectId`  
  Description: Create an API that returns all comments for a given artwork.

- **UI – Comments List**  
  Description: Add a comments list to the artwork detail page that displays all comments and handles the “no comments yet” case.



---

## Admin PBIs (with User Stories)


### PBI: Admin – View All Collections (including unpublished)
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** see all collections, including unpublished ones
- **so** that I can manage which collections appear on the public site.

##

### API:
**Endpoint:** `GET /api/admin/collections`

##

**Description:**  
Create an endpoint that returns all collections stored in SQLite, regardless of publication status.

##

**Acceptance Criteria:**
- [ ] Given: the admin opens the admin collections page  
- [ ] When: the data loads  
- [ ] Then: the admin sees all collections  
- [ ] And: each collection shows whether it is published  
- [ ] And: empty state is shown if there are no collections.

**Subtasks:**
- **API – Admin Collections Overview**  
  Endpoint: `GET /api/admin/collections`  
  Description: Create an API that returns all collections including their publish status.

- **UI – Admin Collections Page**  
  Description: Create an admin page that lists all collections with clear publish/unpublish status.


---

### PBI: Admin – Create New Collection
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** create a new collection
- **so** that I can curate a set of artworks.

##

### API:
**Endpoint:** `POST /api/admin/collections`

##

**Description:**  
Create an endpoint that stores a new collection in SQLite with fields such as name, description, category, cover image, and publication status.

##

**Acceptance Criteria:**
- [ ] Given: the admin fills in the form  
- [ ] When: they click “Save”  
- [ ] Then: the collection is stored  
- [ ] And: it appears in the admin list  
- [ ] And: it is not visible to users until published.

**Subtasks:**
- **API – Create Collection**  
  Endpoint: `POST /api/admin/collections`  
  Description: Create an API that creates a new collection with the main metadata fields.

- **UI – New Collection Form**  
  Description: Create an admin form for creating a collection and sending the data to the API.


---

### PBI: Admin – Edit Collection Details
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** edit the details of an existing collection
- **so** that I can update or correct its information.

##

### API:
**Endpoint:** `PUT /api/admin/collections/:collectionId`

##

**Description:**  
Create an endpoint that updates collection metadata such as name, description, cover image, or category.

##

**Acceptance Criteria:**
- [ ] Given: the admin opens the edit form  
- [ ] When: they save their changes  
- [ ] Then: the updated collection is stored  
- [ ] And: the admin list reflects the changes.

**Subtasks:**
- **API – Update Collection**  
  Endpoint: `PUT /api/admin/collections/:collectionId`  
  Description: Create an API that updates an existing collection’s details.

- **UI – Edit Collection Form**  
  Description: Create an admin edit view that loads a collection’s data and allows changes to be saved via the API.


---

### PBI: Admin – Publish / Unpublish Collection
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** publish or unpublish a collection
- **so** that I can control which collections are visible to normal users.

##

### API:
**Endpoint:** `PATCH /api/admin/collections/:collectionId/publish`

##

**Description:**  
Create an endpoint that toggles a collection’s publication state.

##

**Acceptance Criteria:**
- [ ] Given: a collection exists  
- [ ] When: the admin changes its visibility  
- [ ] Then: the collection becomes visible or hidden for users  
- [ ] And: the collection remains stored either way.

**Subtasks:**
- **API – Toggle Collection Publish State**  
  Endpoint: `PATCH /api/admin/collections/:collectionId/publish`  
  Description: Create an API that updates the publish status of a collection.

- **UI – Publish/Unpublish Control**  
  Description: Add a control in the admin collections page to publish or unpublish a collection via the API.


---

### PBI: Admin – Add MET Artwork to Collection
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** add artworks from the MET database to a collection
- **so** that I can curate which artworks belong to it.

##

**Endpoint:** `POST /api/admin/collections/:collectionId/artworks`

##

**Description:**  
Create an endpoint that links a MET object ID to a collection in SQLite.

##

**Acceptance Criteria:**
- [ ] Given: the admin selects a MET artwork  
- [ ] When: they confirm adding it  
- [ ] Then: it is linked to the collection  
- [ ] And: it appears in the public view (if published).

**Subtasks:**
- **API – Add Artwork to Collection**  
  Endpoint: `POST /api/admin/collections/:collectionId/artworks`  
  Description: Create an API that links a MET object ID to a specific collection.

- **UI – Add Artwork to Collection UI**  
  Description: Add an admin control that lets the admin add a MET artwork to the current collection.


---

### PBI: Admin – Remove MET Artwork from Collection
**Epic:** Admin

**User Story:**
- **As a** admin
- **I want to** remove an artwork from a collection
- **so** that I can update or clean up the curated selection.

##

**Endpoint:** `DELETE /api/admin/collections/:collectionId/artworks/:metObjectId`

##

**Description:**  
Create an endpoint that removes a MET artwork ID from a collection by deleting the relation from SQLite.

##

**Acceptance Criteria:**
- [ ] Given: an artwork is part of a collection  
- [ ] When: the admin removes it  
- [ ] Then: it no longer appears in the collection  
- [ ] And: the artwork itself remains unchanged in the MET API.

**Subtasks:**
- **API – Remove Artwork from Collection**  
  Endpoint: `DELETE /api/admin/collections/:collectionId/artworks/:metObjectId`  
  Description: Create an API that removes the link between a MET artwork and a collection.

- **UI – Remove Artwork from Collection UI**  
  Description: Add an admin control that allows removing an artwork from a collection and updating the list.










### PBI: 
**Epic:** 

**User Story:**
- **As a** 
- **I want to** 
- **so** 

##

**Endpoint:** ` `

##

**Description:**  


##

**Acceptance Criteria:**
- [ ] Given: 
- [ ] When: 
- [ ] Then:
- [ ] And: 
- [ ] And: 
- [ ] And: 

**Subtasks:**
**API – Remove Artwork from Collection**

Endpoint: ` `  

Description: 

**UI – Remove Artwork from Collection UI**  

Description: 































01 ### PBI: Design ERD 

02 ### PBI: Create Database Schema  

03 ### PBI: Prepare Test Dataset  

04 ### PBI: Design UX Wireframes  

05 ### PBI: Define Sitemap & Navigation  

06 ### PBI: UX Heuristic Evaluation of the Art Gallery  

07 ### PBI: Usability Test of First Prototype  

08 ### PBI: Analyze Usability Test Results  

09 ### PBI: Retrospective & Reflection (Sprint Review)  

10 ### PBI: Technical Documentation  

11 ### PBI: Final Presentation Preparation  



13 ### PBI: View Collections Overview
  29- **API – View Collections**  
  30- **UI – Collections Overview Page**  

14 ### PBI: View Artwork (Overview) in a Collection
  31- **API – Collection Artworks**  
  32- **UI – Artworks in Collection**  

15 ### PBI: View Artwork Details
  33- **API – Artwork Details**  
  34- **UI – Artwork Detail Page**  

16 ### PBI: Search by Title (within a Collection)
  35- **API – Title Search in Collection**  
  36- **UI – Title Search UI**  

17 ### PBI: Search by Artist (within a Collection)
  37- **API – Artist Search in Collection**  
  38- **UI – Artist Search UI**  

18 ### PBI: Mark Artwork as Favorite
  39- **API – Favorite Artwork**  
  40- **UI – Favorite Button**  

19 ### PBI: View Favorites Page
  41- **API – Get Favorites**  
  42- **UI – Favorites Page**  

20 ### PBI: Persist Favorites (Stored Between Sessions)
  43- **API – Favorites Persistence**  
  44- **UI – Favorites State Sync**  

21 ### PBI: Add Comments
  45- **API – Add Comment**  
  46- **UI – Comment Form**  

22 ### PBI: View Comments
  47- **API – Get Comments**  
  48- **UI – Comments List**  

23 ### PBI: Admin – View All Collections (including unpublished)
  49- **API – Admin Collections Overview**  
  50- **UI – Admin Collections Page**  

24 ### PBI: Admin – Create New Collection
  51- **API – Create Collection**  
  52- **UI – New Collection Form**  

25 ### PBI: Admin – Edit Collection Details
  53- **API – Update Collection**  
  54- **UI – Edit Collection Form**  

26 ### PBI: Admin – Publish / Unpublish Collection
  55- **API – Toggle Collection Publish State**  
  56- **UI – Publish/Unpublish Control**  

27 ### PBI: Admin – Add MET Artwork to Collection
  57- **API – Add Artwork to Collection**  
  58- **UI – Add Artwork to Collection UI**  

28 ### PBI: Admin – Remove MET Artwork from Collection
  59- **API – Remove Artwork from Collection**  
  60- **UI – Remove Artwork from Collection UI**  




