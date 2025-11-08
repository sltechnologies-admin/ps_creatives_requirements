# Project Scope Grid Editor

A static, fully-functional editable grid application for managing project requirements and scope. Built with vanilla JavaScript and Bootstrap - no backend required!

## ✨ Features

### Core Functionality
- **📝 Inline Editing**: Click any cell to edit directly (like Airtable or Notion)
- **💾 Auto-save**: Changes automatically saved to localStorage on blur
- **➕ Add/Delete Rows**: Dynamically manage project entries
- **📤 Export/Import**: Backup and restore data via JSON files
- **🔍 Search & Filter**: Find entries by page, milestone, or status
- **📊 Progress Tracking**: Visual progress bars and summary statistics

### Grid Columns
| Column | Type | Description |
|--------|------|-------------|
| No | Auto | Auto-generated row number |
| Page | Text | Main page/section name |
| Child-Page | Text | Sub-page or nested structure |
| Milestone (Feature) | Text | Feature or milestone name |
| Description | Textarea | Detailed description |
| Remarks | Textarea | Additional notes |
| Demo Date | Date | Planned demo date |
| Deployment Date | Date | Planned deployment date |
| % of Cost | Number | Percentage of total cost (0-100) |
| Amount | Number | Cost amount in dollars |

### Advanced Features
- **🎨 Color-coded Status**:
  - 🟢 Green = Deployed (deployment date passed)
  - 🟡 Yellow = Demo Done (demo date passed)
  - ⚪ White = Pending
- **↕️ Column Sorting**: Click column headers to sort ascending/descending
- **📈 Progress Overview**: Summary card showing total rows, cost, and average progress
- **🖨️ Print-friendly**: Optimized CSS for printing reports

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server or build tools required!
- *Optional*: API server running at `https://localhost:7130` for live data sync

### Installation
1. Download all files to a folder:
   - `index.html`
   - `app.js`
   - `styles.css`

2. Open `index.html` in your web browser

That's it! The application runs entirely in your browser.

### API Integration
The application automatically attempts to load data from:
```
https://localhost:7130/api/Client/hierarchy
```

**Behavior:**
- ✅ **First load**: Tries to fetch from API
- ✅ **If API fails**: Falls back to localStorage cached data
- ✅ **Offline mode**: Automatically uses cached data
- ✅ **Manual reload**: Click "Reload from API" button to sync
- ✅ **Auto-save**: All edits saved to localStorage for offline access

**API Response Schema:**
```json
[
  {
    "clientId": 1,
    "clientName": "PS Creative",
    "projects": [
      {
        "projectId": 2,
        "milestones": [
          {
            "milestoneId": 0,
            "no": 1,
            "page": "WebSite",
            "childPage": "",
            "milestoneFeature": "Project Kickoff",
            "description": null,
            "remarks": null,
            "demoDate": "",
            "deploymentDate": "",
            "percentOfCost": 0
          }
        ]
      }
    ]
  }
]
```

## 📖 Usage Guide

### Adding Data
1. Click the **"Add Row"** button to create a new entry
2. Click any editable cell to start editing
3. Changes are auto-saved when you click outside the cell (on blur)

### Editing Data
- **Text fields**: Click to edit, press Enter or click outside to save
- **Textareas**: Click to edit, click outside to save
- **Dates**: Click to open date picker
- **Numbers**: Click to edit, validated automatically (% of Cost: 0-100)

### Managing Rows
- **Delete**: Click the trash icon (🗑️) in the Actions column
- **Reorder**: Row numbers update automatically

### Searching & Filtering
- **Search**: Type in the search box to filter by Page or Milestone
- **Status Filter**: Select from dropdown to filter by status (Pending/Demo Done/Deployed)

### Data Synchronization
- **Reload from API**: Click "Reload from API" button to fetch latest data from server
- **Auto-cache**: API data is automatically cached to localStorage
- **Offline editing**: Continue editing even when API is unavailable
- **Manual save**: All edits are saved locally in real-time

### Data Management
- **Export**: Click "Export JSON" to download a backup file
- **Import**: Click "Import JSON" to restore from a backup file
- **Clear All**: Use "Clear All Data" button to reset (confirmation required)

## 💾 Data Persistence

All data is stored in your browser's **localStorage**:
- Automatic save on every edit
- Survives browser refresh
- Per-domain storage (data won't be shared across different websites)
- **Backup recommended**: Use Export JSON regularly

## 🎯 Use Cases

Perfect for:
- ✅ Project requirement tracking
- ✅ Feature scope management
- ✅ Sprint planning
- ✅ Cost estimation
- ✅ Timeline tracking
- ✅ Team collaboration (with JSON export/import)

## 🔧 Technical Stack

- **HTML5**: Semantic structure
- **CSS3**: Custom styling + Bootstrap 5.3
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Bootstrap 5.3**: Responsive grid and components
- **Bootstrap Icons**: UI icons
- **localStorage API**: Client-side data persistence

## 🌐 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Responsive Design

Fully responsive and works on:
- 🖥️ Desktop
- 💻 Laptop
- 📱 Tablet
- 📱 Mobile (with horizontal scroll for wide tables)

## 🔒 Privacy & Security

- **No server communication**: All data stays in your browser
- **No tracking**: No analytics or external calls
- **No authentication**: Simple and direct to use
- **Local only**: Data never leaves your device (unless you export)

## 🛠️ Customization

Easy to customize:
1. **Colors**: Edit CSS variables in `styles.css` (`:root` section)
2. **Columns**: Modify `createRow()` in `app.js`
3. **Validation**: Update `saveCell()` in `app.js`
4. **Sample Data**: Edit `init()` method in `app.js`

## 🚧 Future Enhancements

Potential additions (not yet implemented):
- Multi-user collaboration via GitHub Pages
- Version history tracking
- PDF export
- Chart visualizations
- Formula support in cells
- Conditional formatting rules
- Undo/Redo functionality

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork and enhance! Suggestions for improvement:
- Add more column types (dropdown, checkbox, etc.)
- Implement cell formulas
- Add data validation rules
- Create mobile-optimized view
- Add keyboard shortcuts

## 📞 Support

For issues or questions:
1. Check the browser console for errors (F12)
2. Verify localStorage is enabled in browser settings
3. Try clearing localStorage and restarting
4. Export your data before making major changes

## 🎓 Learning Resources

Built using:
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [MDN Web Docs - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

**Version**: 1.0.0  
**Last Updated**: November 8, 2025  
**Author**: SL Technologies

Enjoy tracking your project scope! 🎉
