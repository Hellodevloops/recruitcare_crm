<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isMultiple ? 'Multiple Candidates Information' : 'Candidate Information' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0;
            background-color: white;
        }
        .header {
            text-align: center;
            background-color: #007bff;
            color: white;
            padding: 15px;
            margin-bottom: 0;
        }
        .header p {
            margin: 0;
            font-size: 14px;
            font-weight: normal;
        }
        .content {
            padding: 20px;
            background-color: white;
        }
        .candidate-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 0 20px 0;
            background-color: white;
            border: 1px solid #ddd;
        }
        .candidate-table th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            border: 1px solid #ddd;
        }
        .candidate-table td {
            padding: 12px 8px;
            border: 1px solid #ddd;
            font-size: 12px;
            vertical-align: top;
        }
        .email-link {
            color: #007bff;
            text-decoration: underline;
        }
        .documents-section {
            margin-top: 20px;
            padding: 0;
            background-color: white;
        }
        .documents-section h3 {
            color: #333;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: bold;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
        }
        .document-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .document-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .document-list li:last-child {
            border-bottom: none;
        }
        .document-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .document-icon {
            font-size: 18px;
            color: #666;
        }
        .document-details {
            display: flex;
            flex-direction: column;
        }
        .document-name {
            font-weight: bold;
            color: #333;
            font-size: 13px;
        }
        .document-type {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }
        .document-status {
            color: #28a745;
            font-size: 12px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .footer p {
            margin: 3px 0;
        }
        .no-documents {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
        }
        .candidate-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        .candidate-header {
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            color: #333;
        }
        .candidate-content {
            padding: 15px;
        }
        @media (max-width: 768px) {
            .container {
                padding: 0;
            }
            .candidate-table {
                font-size: 10px;
            }
            .candidate-table th,
            .candidate-table td {
                padding: 8px 4px;
            }
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p>Sent on: {{ now()->format('F j, Y \a\t g:i A') }}</p>
        </div>

        <div class="content">
            @if($isMultiple)
                <h2 style="margin-bottom: 20px; color: #333;">Multiple Candidates Information</h2>
                @foreach($candidates as $candidate)
                    <div class="candidate-section">
                        <div class="candidate-header">
                            Candidate: {{ $candidate->name }}
                        </div>
                        <div class="candidate-content">
                            <table class="candidate-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Contact No.</th>
                                        <th>Current Organisation</th>
                                        <th>Current Designation</th>
                                        <th>Experience</th>
                                        <th>Current CTC</th>
                                        <th>Expected CTC</th>
                                        <th>Location</th>
                                        <th>Notice Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{{ $candidate->created_at ? \Carbon\Carbon::parse($candidate->created_at)->format('d/m/Y') : 'N/A' }}</td>
                                        <td>{{ $candidate->name }}</td>
                                        <td><a href="mailto:{{ $candidate->email }}" class="email-link">{{ $candidate->email }}</a></td>
                                        <td>{{ $candidate->phone }}</td>
                                        <td>{{ $candidate->company_name ?? 'N/A' }}</td>
                                        <td>{{ $candidate->current_designation ?? 'N/A' }}</td>
                                        <td>{{ $candidate->experience ?? 'N/A' }}</td>
                                        <td>{{ $candidate->current_ctc ? '₹' . number_format($candidate->current_ctc) : 'N/A' }}</td>
                                        <td>{{ $candidate->expected_ctc ? '₹' . number_format($candidate->expected_ctc) : 'N/A' }}</td>
                                        <td>{{ $position->city ?? 'N/A' }}</td>
                                        <td>{{ $candidate->notice_period ?? 'N/A' }}</td>
                                    </tr>
                                </tbody>
                            </table>

                            @if($candidate->resume || ($candidate->documents && $candidate->documents->count() > 0))
                            <div class="documents-section">
                                <h3>Documents & Attachments</h3>
                                <ul class="document-list">
                                    @if($candidate->resume)
                                        <li>
                                            <div class="document-info">
                                                <span class="document-icon">📄</span>
                                                <div class="document-details">
                                                    <span class="document-name">Resume</span>
                                                    <span class="document-type">Resume Document</span>
                                                </div>
                                            </div>
                                            <span class="document-status">Attached</span>
                                        </li>
                                    @endif
                                    @if($candidate->documents && $candidate->documents->count() > 0)
                                        @foreach($candidate->documents as $document)
                                            <li>
                                                <div class="document-info">
                                                    <span class="document-icon">
                                                        @switch($document->document_type ?? '')
                                                            @case('pan_card')
                                                                🆔
                                                                @break
                                                            @case('aadhar_card')
                                                                🆔
                                                                @break
                                                            @case('experience_certificate')
                                                                🏢
                                                                @break
                                                            @case('salary_slip')
                                                                💰
                                                                @break
                                                            @default
                                                                📄
                                                        @endswitch
                                                    </span>
                                                    <div class="document-details">
                                                        <span class="document-name">{{ $document->name ?? 'Document' }}</span>
                                                        <span class="document-type">
                                                            @switch($document->document_type ?? '')
                                                                @case('pan_card')
                                                                    PAN Card
                                                                    @break
                                                                @case('aadhar_card')
                                                                    Aadhar Card
                                                                    @break
                                                                @case('experience_certificate')
                                                                    Experience Certificate
                                                                    @break
                                                                @case('salary_slip')
                                                                    Salary Slip
                                                                    @break
                                                                @default
                                                                    Other Document
                                                            @endswitch
                                                        </span>
                                                    </div>
                                                </div>
                                                <span class="document-status">Attached</span>
                                            </li>
                                        @endforeach
                                    @endif
                                </ul>
                            </div>
                            @else
                            <div class="documents-section">
                                <h3>Documents & Attachments</h3>
                                <div class="no-documents">
                                    <p>No documents available for this candidate.</p>
                                </div>
                            </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            @else
                <table class="candidate-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Contact No.</th>
                            <th>Current Organisation</th>
                            <th>Current Designation</th>
                            <th>Experience</th>
                            <th>Current CTC</th>
                            <th>Expected CTC</th>
                            <th>Location</th>
                            <th>Notice Period</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($candidates as $candidate)
                        <tr>
                            <td>{{ $candidate->created_at ? \Carbon\Carbon::parse($candidate->created_at)->format('d/m/Y') : 'N/A' }}</td>
                            <td>{{ $candidate->name }}</td>
                            <td><a href="mailto:{{ $candidate->email }}" class="email-link">{{ $candidate->email }}</a></td>
                            <td>{{ $candidate->phone }}</td>
                            <td>{{ $candidate->company_name ?? 'N/A' }}</td>
                            <td>{{ $candidate->current_designation ?? 'N/A' }}</td>
                            <td>{{ $candidate->experience ?? 'N/A' }}</td>
                            <td>{{ $candidate->current_ctc ? '₹' . number_format($candidate->current_ctc) : 'N/A' }}</td>
                            <td>{{ $candidate->expected_ctc ? '₹' . number_format($candidate->expected_ctc) : 'N/A' }}</td>
                            <td>{{ $position->city ?? 'N/A' }}</td>
                            <td>{{ $candidate->notice_period ?? 'N/A' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>

                @if($candidates->first()->resume || ($candidates->first()->documents && $candidates->first()->documents->count() > 0))
                <div class="documents-section">
                    <h3>Documents & Attachments</h3>
                    <ul class="document-list">
                        @if($candidates->first()->resume)
                            <li>
                                <div class="document-info">
                                    <span class="document-icon">📄</span>
                                    <div class="document-details">
                                        <span class="document-name">Resume</span>
                                        <span class="document-type">Resume Document</span>
                                    </div>
                                </div>
                                <span class="document-status">Attached</span>
                            </li>
                        @endif
                        @if($candidates->first()->documents && $candidates->first()->documents->count() > 0)
                            @foreach($candidates->first()->documents as $document)
                                <li>
                                    <div class="document-info">
                                        <span class="document-icon">
                                            @switch($document->document_type ?? '')
                                                @case('pan_card')
                                                    🆔
                                                    @break
                                                @case('aadhar_card')
                                                    🆔
                                                    @break
                                                @case('experience_certificate')
                                                    🏢
                                                    @break
                                                @case('salary_slip')
                                                    💰
                                                    @break
                                                @default
                                                    📄
                                            @endswitch
                                        </span>
                                        <div class="document-details">
                                            <span class="document-name">{{ $document->name ?? 'Document' }}</span>
                                            <span class="document-type">
                                                @switch($document->document_type ?? '')
                                                    @case('pan_card')
                                                        PAN Card
                                                        @break
                                                    @case('aadhar_card')
                                                        Aadhar Card
                                                        @break
                                                    @case('experience_certificate')
                                                        Experience Certificate
                                                        @break
                                                    @case('salary_slip')
                                                        Salary Slip
                                                        @break
                                                    @default
                                                        Other Document
                                                @endswitch
                                            </span>
                                        </div>
                                    </div>
                                    <span class="document-status">Attached</span>
                                </li>
                            @endforeach
                        @endif
                    </ul>
                </div>
                @else
                <div class="documents-section">
                    <h3>Documents & Attachments</h3>
                    <div class="no-documents">
                        <p>No documents available for this candidate.</p>
                    </div>
                </div>
                @endif
            @endif

            <div class="footer">
                <p>This email was automatically generated by the CRM system.</p>
            </div>
        </div>
    </div>
</body>
</html> 