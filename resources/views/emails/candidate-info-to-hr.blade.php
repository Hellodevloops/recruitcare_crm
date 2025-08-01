<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candidate Information</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        .section h2 {
            color: #495057;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            padding: 8px 12px;
            background-color: white;
            border-radius: 4px;
            border: 1px solid #dee2e6;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }
        .attachments {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
        }
        .attachments h3 {
            color: #0056b3;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .attachment-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .attachment-list li {
            padding: 8px 0;
            border-bottom: 1px solid #b3d9ff;
        }
        .attachment-list li:last-child {
            border-bottom: none;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Candidate Information</h1>
            <p>Position: {{ $position->title }}</p>
            <p>Sent on: {{ now()->format('F j, Y \a\t g:i A') }}</p>
        </div>

        <div class="section">
            <h2>Personal Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">{{ $candidate->name }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email Address</div>
                    <div class="info-value">{{ $candidate->email }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">{{ $candidate->phone }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Company</div>
                    <div class="info-value">{{ $candidate->company_name ?? 'N/A' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        @if($candidate->status)
                            <span class="status-badge status-{{ strtolower($candidate->status) }}">
                                {{ $candidate->status }}
                            </span>
                        @else
                            N/A
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Position Details</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Position Title</div>
                    <div class="info-value">{{ $position->title }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Designation</div>
                    <div class="info-value">{{ $position->designation ?? 'N/A' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Experience Required</div>
                    <div class="info-value">{{ $position->experience ?? 'N/A' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Budget</div>
                    <div class="info-value">
                        @if($position->budget)
                            ₹{{ number_format($position->budget, 2) }}
                        @else
                            N/A
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Store</div>
                    <div class="info-value">{{ $position->store ?? 'N/A' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">City</div>
                    <div class="info-value">{{ $position->city ?? 'N/A' }}</div>
                </div>
            </div>
        </div>

        @if($candidate->resume || ($candidate->documents && count($candidate->documents) > 0))
        <div class="attachments">
            <h3>📎 Attachments</h3>
            <ul class="attachment-list">
                @if($candidate->resume)
                    <li>📄 Resume - {{ basename($candidate->resume) }}</li>
                @endif
                @if($candidate->documents && is_array($candidate->documents))
                    @foreach($candidate->documents as $document)
                        <li>📄 {{ $document['name'] ?? 'Document' }} - {{ isset($document['size']) ? number_format($document['size'] / 1024, 2) . ' KB' : 'N/A' }}</li>
                    @endforeach
                @endif
            </ul>
        </div>
        @endif

        <div class="footer">
            <p>This email was automatically generated by the CRM system.</p>
            <p>For any questions, please contact the system administrator.</p>
        </div>
    </div>
</body>
</html> 