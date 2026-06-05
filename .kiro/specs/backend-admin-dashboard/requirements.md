# Requirements Document

## Introduction

This feature adds a Firebase-powered backend and admin dashboard to the Sim Đệ Nhất website. Currently, SIM card data is hardcoded in the frontend. Firebase Firestore will store SIM card data, Firebase Authentication will protect admin access, and an admin dashboard will allow the store owner to manage (create, edit, delete) SIM card listings. The Storefront will be updated to fetch data from Firestore instead of using static mock data.

## Glossary

- **Firestore**: Google Cloud Firestore database used to store and query SIM card records
- **Firebase_Auth**: Firebase Authentication service used to authenticate the Owner
- **Firebase_Storage**: Firebase Cloud Storage used for bulk upload file processing
- **Admin_Dashboard**: A React and TypeScript web application for the store owner to manage SIM card inventory, built as a separate route or section within the existing project
- **Storefront**: The existing public-facing React application where customers browse SIM cards
- **SIM_Card**: A product listing containing a phone number, carrier, category, price, and optional description
- **Owner**: The store administrator who manages SIM card inventory through the Admin Dashboard
- **Carrier**: The mobile network operator (Viettel, Mobifone, or Vinaphone)
- **Category**: A classification for SIM numbers (Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, Giá Rẻ)

## Requirements

### Requirement 1: SIM Card Data Storage in Firestore

**User Story:** As the Owner, I want SIM card data stored in Firestore, so that listings are persisted in the cloud and always available without managing server infrastructure.

#### Acceptance Criteria

1. THE Firestore SHALL store SIM_Card documents with the following fields: id, number, carrier, category, price, description, and createdAt timestamp
2. THE Firestore SHALL enforce that Carrier values are one of Viettel, Mobifone, or Vinaphone
3. THE Firestore SHALL enforce that Category values are one of Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, or Giá Rẻ
4. THE Firestore SHALL persist all SIM_Card data across sessions without data loss

### Requirement 2: Public SIM Card Data Access

**User Story:** As a customer visiting the Storefront, I want SIM card listings loaded from Firestore, so that I always see the latest available inventory.

#### Acceptance Criteria

1. WHEN the Storefront loads, THE Storefront SHALL query Firestore for all available SIM_Card documents
2. THE Firestore security rules SHALL allow unauthenticated read access to the SIM_Card collection
3. THE Storefront SHALL receive SIM_Card data with fields matching the existing data structure (id, number, carrier, category, price, description)
4. THE Storefront SHALL maintain all existing filter, search, sort, and view functionality using data from Firestore

### Requirement 3: Admin Authentication with Firebase Auth

**User Story:** As the Owner, I want the admin interface protected by Firebase Authentication, so that only authorized users can manage SIM card listings.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the Admin_Dashboard, THE Admin_Dashboard SHALL redirect to a login page
2. WHEN the Owner provides valid email and password credentials, THE Firebase_Auth SHALL authenticate the user and grant access to the Admin_Dashboard
3. WHILE the Owner is authenticated, THE Admin_Dashboard SHALL allow access to all management features
4. WHEN the Owner clicks logout, THE Firebase_Auth SHALL end the session and THE Admin_Dashboard SHALL redirect to the login page
5. THE Firestore security rules SHALL allow write access to the SIM_Card collection only for authenticated users

### Requirement 4: SIM Card Management (CRUD)

**User Story:** As the Owner, I want to create, view, edit, and delete SIM card listings through the admin dashboard, so that I can keep the inventory up to date.

#### Acceptance Criteria

1. WHEN the Owner submits a new SIM_Card with number, carrier, category, and price, THE Admin_Dashboard SHALL create the document in Firestore with a generated id and createdAt timestamp
2. WHEN the Owner opens the Admin_Dashboard, THE Admin_Dashboard SHALL display all SIM_Card records with their number, carrier, category, price, and creation date
3. WHEN the Owner updates a SIM_Card record, THE Admin_Dashboard SHALL persist the changes to Firestore and confirm the update
4. WHEN the Owner deletes a SIM_Card record, THE Admin_Dashboard SHALL remove the document from Firestore and confirm the deletion
5. IF the Owner submits a SIM_Card with missing required fields (number, carrier, category, or price), THEN THE Admin_Dashboard SHALL display a validation error and prevent submission
6. IF the Owner submits a SIM_Card with an invalid carrier or category value, THEN THE Admin_Dashboard SHALL display a validation error indicating the invalid field

### Requirement 5: Bulk SIM Card Upload

**User Story:** As the Owner, I want to upload multiple SIM cards at once from a file, so that I can efficiently add inventory in bulk rather than one by one.

#### Acceptance Criteria

1. WHEN the Owner uploads a CSV or JSON file containing multiple SIM_Card records, THE Admin_Dashboard SHALL parse the file and validate each record
2. WHEN all records in the file are valid, THE Admin_Dashboard SHALL create all SIM_Card documents in Firestore
3. IF any record in a bulk upload has validation errors, THEN THE Admin_Dashboard SHALL report which records failed validation and which succeeded
4. THE Admin_Dashboard SHALL provide a file upload interface that accepts CSV and JSON formats for bulk import
5. THE Admin_Dashboard SHALL display a preview of parsed records before confirming the bulk upload

### Requirement 6: Frontend Integration with Firebase

**User Story:** As a developer, I want the Storefront to read SIM card data from Firestore directly, so that the site displays live inventory without a custom backend server.

#### Acceptance Criteria

1. WHEN the Storefront loads, THE Storefront SHALL initialize the Firebase SDK and fetch SIM_Card data from Firestore
2. WHILE the Storefront is fetching data from Firestore, THE Storefront SHALL display a loading indicator
3. IF Firestore is unreachable or returns an error, THEN THE Storefront SHALL display an error message to the user
4. THE Storefront SHALL remove the hardcoded SIM card data file and rely entirely on Firestore for SIM_Card data

### Requirement 7: Admin Dashboard Interface

**User Story:** As the Owner, I want a clean and functional admin interface built with React and TypeScript, so that I can manage inventory without technical knowledge.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL be built using React and TypeScript, consistent with the existing Storefront technology stack
2. THE Admin_Dashboard SHALL display a table of all SIM_Card records with columns for number, carrier, category, price, and creation date
3. THE Admin_Dashboard SHALL provide a form for adding new SIM_Card records with dropdown selectors for carrier and category
4. THE Admin_Dashboard SHALL provide inline or modal editing for existing SIM_Card records
5. WHEN the Owner performs a create, update, or delete operation, THE Admin_Dashboard SHALL display a success or error notification
6. THE Admin_Dashboard SHALL support filtering and searching SIM_Card records by number, carrier, or category
7. THE Admin_Dashboard SHALL read and write data through Firestore, reflecting the same SIM_Card collection shown on the Storefront
8. THE Admin_Dashboard SHALL be accessible at a dedicated route (e.g., /admin) within the same application
