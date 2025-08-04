# Document Access Fix - 403 Forbidden Error Resolution

## Problem
When trying to view candidate documents in the Show.tsx page, users were getting a 403 Forbidden error because the documents were stored in Laravel's protected storage directory.

## Root Cause
Laravel's `storage/app/public` directory is not publicly accessible by default. Direct access to files in this directory results in 403 Forbidden errors.

## Solution Implemented

### 1. Created Storage Symbolic Link
```bash
php artisan storage:link
```
This creates a symbolic link from `public/storage` to `storage/app/public`, making files accessible via `/storage/` URL.

### 2. Added Secure Download Routes
Created secure download methods in controllers that:
- Check user authentication
- Validate file existence
- Log download attempts
- Handle errors gracefully

#### DocumentController.php
- Added `download()` method for general documents
- Route: `/documents/{document}/download`

#### CandidateController.php  
- Added `downloadResume()` method for candidate resumes
- Route: `/candidates/{candidate}/resume/download`

### 3. Updated Frontend Links
Updated all frontend components to use secure download routes instead of direct storage links:

#### Files Updated:
- `resources/js/pages/positions/Show.tsx`
- `resources/js/pages/candidates/Show.tsx`
- `resources/js/pages/candidates/PersonalDocumentsSection.tsx`
- `resources/js/pages/candidates/DocumentsSection.tsx`

#### Changes Made:
- Resume links: `/storage/${candidate.resume}` → `/candidates/${candidate.id}/resume/download`
- Document links: `/storage/${doc.path}` → `/documents/${doc.id}/download`

### 4. Enhanced Security Features
- Authentication checks before file access
- File existence validation
- Comprehensive error logging
- Proper MIME type handling
- Secure file serving with appropriate headers

## Benefits
1. **Security**: Files are now served through authenticated routes
2. **Logging**: All download attempts are logged for audit purposes
3. **Error Handling**: Graceful error handling with proper HTTP status codes
4. **User Experience**: No more 403 errors when viewing documents
5. **Maintainability**: Centralized file access control

## Testing
To test the fix:
1. Navigate to any position's show page
2. Try to view candidate documents
3. Verify that documents open without 403 errors
4. Check that resume downloads work properly

## Routes Added
```php
Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
Route::get('/candidates/{candidate}/resume/download', [CandidateController::class, 'downloadResume'])->name('candidates.resume.download');
```

## Files Modified
- `app/Http/Controllers/DocumentController.php`
- `app/Http/Controllers/CandidateController.php`
- `routes/web.php`
- `resources/js/pages/positions/Show.tsx`
- `resources/js/pages/candidates/Show.tsx`
- `resources/js/pages/candidates/PersonalDocumentsSection.tsx`
- `resources/js/pages/candidates/DocumentsSection.tsx` 