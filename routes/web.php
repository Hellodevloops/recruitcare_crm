<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\StageController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\HrController;
use App\Http\Controllers\PositionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('leads', function () {
        return Inertia::render('leads');
    })->name('leads');
    Route::get('demo', function () {
        return Inertia::render('demo');
    })->name('demo');
    Route::get('calendar', function () {
        return Inertia::render('calendar');
    })->name('calendar');
    Route::get('leads/detail', function () {
        return Inertia::render('leads/detail');
    })->name('leads.detail');
    Route::get('onboarding', function () {
        return Inertia::render('onboarding/page');
    })->name('onboarding');

    // routes/web.php

    // Quotation routes
    Route::get('/quotations', [QuotationController::class, 'index'])->name('quotations.index');
    Route::get('/quotations/create', [QuotationController::class, 'create'])->name('quotations.create');
    Route::post('/quotations', [QuotationController::class, 'store'])->name('quotations.store');
    Route::get('/quotations/{id}', [QuotationController::class, 'show'])->name('quotations.show');
    Route::get('/quotations/{id}/edit', [QuotationController::class, 'edit'])->name('quotations.edit');
    Route::put('/quotations/{id}', [QuotationController::class, 'update'])->name('quotations.update');
    Route::delete('/quotations/{id}', [QuotationController::class, 'destroy'])->name('quotations.destroy');

    // Invoice routes
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('/invoices/{id}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::get('/invoices/{id}/edit', [InvoiceController::class, 'edit'])->name('invoices.edit');
    Route::put('/invoices/{id}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    // Candidate routes
    Route::get('/candidates', [CandidateController::class, 'index'])->name('candidates.index');
    Route::get('/candidates/create', [CandidateController::class, 'create'])->name('candidates.create');
    Route::post('/candidates', [CandidateController::class, 'store'])->name('candidates.store');
    Route::get('/candidates/{candidate}', [CandidateController::class, 'show'])->name('candidates.show');
    Route::get('/candidates/{candidate}/data', [CandidateController::class, 'getCandidateData'])->name('candidates.data.show');
    Route::get('/candidates/{candidate}/edit', [CandidateController::class, 'edit'])->name('candidates.edit');
    Route::put('/candidates/{candidate}', [CandidateController::class, 'update'])->name('candidates.update');
    Route::delete('/candidates/{candidate}', [CandidateController::class, 'destroy'])->name('candidates.destroy');
    Route::put('/candidates/{candidate}/status', [CandidateController::class, 'updateStatus'])->name('candidates.updateStatus');
    Route::get('/candidates/{candidate}/logs', [CandidateController::class, 'logs'])->name('candidates.logs');
    Route::get('/candidates-data', [CandidateController::class, 'getCandidatesData'])->name('candidates.data');
    Route::post('/api/check-phone', [CandidateController::class, 'checkPhone'])->name('candidates.checkPhone');
    Route::get('/candidates/{candidate}/resume/download', [CandidateController::class, 'downloadResume'])->name('candidates.resume.download');


    Route::prefix('followups')->group(function () {
        Route::get('/', [FollowUpController::class, 'index'])->name('followups.index');
        Route::get('/create', [FollowUpController::class, 'create'])->name('followups.create');
        Route::post('/', [FollowUpController::class, 'store'])->name('followups.store');
        Route::get('/{followup}', [FollowUpController::class, 'show'])->name('followups.show');
        Route::get('/{followup}/edit', [FollowUpController::class, 'edit'])->name('followups.edit');
        Route::put('/{followup}', [FollowUpController::class, 'update'])->name('followups.update');
        Route::delete('/{followup}', [FollowUpController::class, 'destroy'])->name('followups.destroy');
        Route::patch('/{followup}/complete', [FollowUpController::class, 'complete'])->name('followups.complete');
    });

    // Brand routes
    Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create');
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit');
    Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');
    Route::get('/brands-data', [BrandController::class, 'getBrandsData'])->name('brands.data');

    // Position routes
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::get('/positions/create', [PositionController::class, 'create'])->name('positions.create');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::get('/positions/{position}', [PositionController::class, 'show'])->name('positions.show');
    Route::get('/positions/{position}/edit', [PositionController::class, 'edit'])->name('positions.edit');
    Route::put('/positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::post('/positions/{position}/send-candidate-info', [PositionController::class, 'sendCandidateInfoToHr'])->name('positions.send-candidate-info');
    Route::post('/positions/{position}/send-multiple-candidates-info', [PositionController::class, 'sendMultipleCandidatesInfoToHr'])->name('positions.send-multiple-candidates-info');
    Route::delete('/positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    Route::get('/positions-data', [PositionController::class, 'getPositionsData'])->name('positions.data');

    // Stage routes
    Route::get('/stages', [StageController::class, 'index'])->name('stages.index');
    Route::post('/stages', [StageController::class, 'store'])->name('stages.store');
    Route::get('/stages/{stage}/edit', [StageController::class, 'edit'])->name('stages.edit');
    Route::put('/stages/{stage}', [StageController::class, 'update'])->name('stages.update');
    Route::delete('/stages/{stage}', [StageController::class, 'destroy'])->name('stages.destroy');
    Route::post('/stages/reorder', [StageController::class, 'reorder'])->name('stages.reorder');
    Route::get('/stages-data', [StageController::class, 'getStagesData'])->name('stages.data');

    Route::get('/hr', [HrController::class, 'index'])->name('hr.index');
    Route::post('/hr', [HrController::class, 'store'])->name('hr.store');
    Route::post('/hr/brand', [HrController::class, 'storeBrand'])->name('hr.store.brand');
    Route::get('/hr-data', [HrController::class, 'getHrData'])->name('hr.data');

    // Pipeline routes
    Route::get('/pipelines', [PipelineController::class, 'index'])->name('pipelines.index');
    Route::get('/pipelines/{pipeline}', [PipelineController::class, 'show'])->name('pipelines.show');
    Route::post('/pipelines', [PipelineController::class, 'store'])->name('pipelines.store');
    Route::put('/pipelines/{pipeline}', [PipelineController::class, 'update'])->name('pipelines.update');
    Route::delete('/pipelines/{pipeline}', [PipelineController::class, 'destroy'])->name('pipelines.destroy');
    Route::get('/pipelines-data', [PipelineController::class, 'data'])->name('pipelines.data');

    // Resource routes for Deals, Activities, Notes, and Documents
    Route::resource('deals', DealController::class)->only(['index', 'create', 'store', 'show', 'update', 'destroy']);
    Route::post('deals_store_in_candidate', [DealController::class, 'deals_store_in_candidate'])->name('deals_store_in_candidate');

    Route::resource('activities', ActivityController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::resource('notes', NoteController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::resource('documents', DocumentController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');

    //report

    // User report routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/user/{userId}', [ReportController::class, 'getUserReport'])->name('reports.user');

    // Activity log specific routes
    Route::get('/reports/activity-logs/{entityType}/{entityId}', [ReportController::class, 'getActivityLog'])->name('reports.activity-logs');
    Route::get('/reports/user/{userId}/activity-logs', [ReportController::class, 'getUserActivityLogs'])->name('reports.user.activity-logs');

    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::post('/calendar', [CalendarController::class, 'store']);
    Route::put('/calendar/{activity}', [CalendarController::class, 'update']);
    Route::put('/calendar/{activity}/drag', [CalendarController::class, 'dragUpdate']);
    Route::delete('/calendar/{activity}', [CalendarController::class, 'destroy']);

    Route::get('/roles-permissions', [RolePermissionController::class, 'index'])
        ->name('roles-permissions.index');
    Route::post('/roles', [RolePermissionController::class, 'storeRole'])->name('roles.store');
    Route::put('/roles/{role}', [RolePermissionController::class, 'updateRole'])->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('roles.destroy');

    // User Management Routes
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');

    // Leads routes
    Route::get('/leads', fn() => inertia('Leads'))->middleware('role_or_permission:view leads')->name('leads.index');
    Route::get('/leads/{id}', fn($id) => inertia('LeadDetail'))->middleware('role_or_permission:view leads')->name('leads.show');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
