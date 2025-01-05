# Native Widgets Implementation

## Overview

```mermaid
graph TB
    subgraph iOS Widget
        A[WidgetKit] --> B[Timeline Provider]
        B --> C[Widget View]
        C --> D[Small Widget]
        C --> E[Medium Widget]
    end

    subgraph Android Widget
        F[AppWidgetProvider] --> G[RemoteViews]
        G --> H[Widget Layout]
        H --> I[Certificate List]
        H --> J[Status Icons]
    end

    subgraph Shared Data
        K[Local Storage] --> A
        K --> F
    end
```

## iOS Implementation

```mermaid
sequenceDiagram
    participant W as Widget
    participant T as Timeline Provider
    participant S as Shared Storage
    participant A as App

    W->>T: Request Update
    T->>S: Load Data
    S-->>T: Certificate Data
    T->>W: Update Timeline
    A->>S: Update Certificates
    S->>W: Trigger Refresh
```

## Android Implementation

```mermaid
sequenceDiagram
    participant W as Widget
    participant P as Provider
    participant S as SharedPreferences
    participant A as App

    W->>P: onUpdate
    P->>S: Load Data
    S-->>P: Certificate Data
    P->>W: Update Views
    A->>S: Update Data
    A->>W: Request Update
```

## Features

### iOS Widget
- Small and medium sizes
- Dynamic updates
- Interactive elements
- Dark/Light mode support

### Android Widget
- Responsive layout
- Custom backgrounds
- Touch interactions
- Auto-refresh

## Configuration

### iOS Setup
```swift
// Register widget extension
let kind: String = "SSLWidget"
let configuration = StaticConfiguration(kind: kind, provider: Provider())
```

### Android Setup
```xml
<!-- Widget info in AndroidManifest.xml -->
<receiver android:name=".SSLWidget">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/ssl_widget_info" />
</receiver>
```

## Data Flow

1. App updates certificate data
2. Data stored in shared storage
3. Widgets observe changes
4. UI updates automatically

## Best Practices

- Minimize memory usage
- Optimize refresh rates
- Handle errors gracefully
- Support all device sizes