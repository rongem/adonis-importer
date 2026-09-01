# ADONIS Importer

## Overview

The ADONIS Importer is a web-based application that simplifies the process of configuring and creating data imports for the ADONIS process management software. It streamlines the traditionally manual and error-prone configuration workflow by automating the generation of XML configuration files and Excel templates.

## The Problem

Configuring imports in ADONIS has traditionally been a complex, time-consuming, and error-prone process:

1. **Property Discovery**: You need to know all available properties (which are often hidden in production systems).
2. **Manual XML Configuration**: A custom XML configuration file must be created manually for each import scenario.
3. **Template Creation**: An Excel template matching the XML configuration must be developed separately.

Since these steps are all manual, the error rate is high, leading to overly complex and generic import configurations that try to handle all possible scenarios rather than creating targeted, specific configurations for individual needs.

## The Solution

ADONIS Importer solves these problems by automating the entire workflow:

1. **Browse Properties**: Get an overview of all available properties in your ADONIS system configuration.
2. **Select What You Need**: Choose only the properties you want to import.
3. **Automatic Generation**: The XML configuration file and Excel template are automatically generated.
4. **Quick Import**: Simply import the generated files and create precise configurations quickly and efficiently.

## Key Features

- **Browser-Based**: The entire application runs in your browser—no server required for data processing.
- **Secure**: After initial loading, no communication with the ADONIS system occurs in the browser. This allows you to securely access any ADONIS system that your PC can reach.
- **No Data Residue**: All processing happens client-side, ensuring data security and privacy.
- **User-Friendly Workflow**: Guided step-by-step configuration process.
- **Automatic File Generation**: Get XML config files and Excel templates instantly.

## Requirements

To use ADONIS Importer, the following prerequisites must be met:

### ADONIS System Configuration

- **REST API**: Must be enabled with Basic Authentication.
- **CORS**: Must be enabled to allow browser access.
- **User Account**: A local ADONIS user account (LDAP accounts are not supported).
- **Network Access**: Your client IP address must be whitelisted in ADONIS.

For detailed setup instructions, see the [ADONIS Administration Manual](https://docs.boc-group.com/adonis/en/docs/17.1/admin_page/compset-00000/#compset-R0000).

### Client Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Network connectivity to the ADONIS server
- Valid ADONIS credentials

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd adonis-importer
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200`

### Using the Application

1. **Connect to ADONIS**: 
   - Enter the hostname/URL of your ADONIS system
   - Provide your ADONIS username and password
   - Click Connect

2. **Browse Configuration**: 
   - Select the object group or repository you want to configure
   - Review the available properties

3. **Select Properties**: 
   - Check the properties you want to import
   - Configure import settings as needed

4. **Generate Files**: 
   - The system automatically generates:
     - XML configuration file
     - Excel template matching your selection
   - Download both files

5. **Import into ADONIS**: 
   - Use the generated files in ADONIS to create your import configuration
   - Use the Excel template to enter your data

## Build and Deployment

### Development

```bash
npm start
```

Starts the development server with hot-reload enabled.

### Build for Production

```bash
npm run build
```

Generates optimized production build in the `dist/` directory.

### Testing

```bash
npm test
```

Runs the test suite.

### Build and Deploy with Docker

The repository includes Docker configuration for containerization:

```bash
# Build Docker image
./docker-create.sh

# Run Docker container
./docker-run.sh
```

## Technology Stack

- **Frontend Framework**: Angular 22
- **Language**: TypeScript
- **Styling**: SCSS
- **HTTP Client**: Angular HttpClient with REST API
- **XML Processing**: fast-xml-parser
- **Excel Generation**: XLSX (SheetJS)
- **State Management**: RxJS
- **Testing**: Vitest with jsdom

## Architecture

The application follows a modular component-based architecture:

- **login/**: Authentication component
- **classes/**: Components for managing ADONIS object classes
- **import/**: Import workflow components
  - `choose-repository/`: Repository selection
  - `choose-objectgroup/`: Object group selection
  - `import-table/`: Property selection interface
  - `import-results/`: Results display and file download
- **lib/**: Shared utilities and services
  - `data-access/`: API communication layer
  - `guards/`: Route guards
  - `interceptors/`: HTTP interceptors
  - `store/`: State management
  - `workflows/`: Workflow orchestration

## Performance Notes

**REST API Performance**: The ADONIS REST API can be slow and requires many API calls during the property discovery phase. During these operations, a pulsing square indicates activity. The application remains partially interactive during this time, where it makes sense.

## Security Considerations

- **No Backend Required**: The application contains no backend component—it's entirely browser-based.
- **Local Processing**: All data processing happens on your local machine.
- **Basic Auth**: Uses HTTP Basic Authentication (ensure HTTPS in production).
- **No Data Storage**: No data is stored or transmitted beyond your browser session.

## Roadmap

### Future Features

- **Direct Import**: Direct import functionality is technically prepared but currently disabled. Once ADONIS provides a complete REST API, direct data import from any table via clipboard will be possible. Column headers can be repositioned to adjust import mapping. Note: Currently only attributes can be imported; relationships to other objects are not yet supported.

## Troubleshooting

### Connection Issues

- Verify that ADONIS REST API is enabled
- Check that CORS is configured correctly
- Confirm your client IP is whitelisted
- Ensure you're using a local ADONIS user account (not LDAP)

### File Generation Issues

- Verify all required properties are selected
- Check browser console for error messages
- Ensure sufficient disk space for download

### Performance Issues

- REST API calls can be slow—this is expected behavior
- Close other tabs to free up bandwidth
- Try again during off-peak hours if possible

## Contributing

Contributions are welcome! Please ensure:

- Code follows the existing style (enforced by Prettier for HTML, TypeScript conventions)
- Tests are included and pass
- Documentation is updated accordingly

## License

[Insert appropriate license information]

## Support

For issues, questions, or suggestions:

- Check the ADONIS documentation
- Review existing issues in the repository
- Contact your ADONIS administrator for system-specific questions

## Version

Current Version: 0.0.39

---

**Note**: This application is designed to work with ADONIS 17.1 and later. Compatibility with other versions may vary.
