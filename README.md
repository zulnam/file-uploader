# Task Boilerplate

This is a simple boilerplate for the frontend task. You are free to use it and modify it to your needs.

## Valentins Notes

This was a very fun task to solve. I split the work into the following tasks:

T1 - FileUpload Component (size S)
Requirements:
- accepts uploads of various file types and sizes 
- reusability with minimal effort 
- files accepted via click or drag and drop (for now outputs console.log) 
- pluggable upload logic 
- implement on main page 
- accessibility 
- test coverage 
- basic validation (optional) 

T2 - FileList Component (size S) 
Requirements:
- loading state
- lists files present into uploads 
- connect to GET 
- implement on main page 
- accessibility 
- test coverage 

T3 - fileUpload hook (size M)
Requirements:
- connects to provided API 
- handles single files, bulk files and chunks
- progress state for chunks
- implementation with Upload Component 
- triggers refresh for File List component 
- test coverage

Of course, when it was time to put them alltogether some of the work was outside of the scope of any task (with ticket number `NA`). Under normal circumstances, with stakeholders, I would have done a further planning session or added special tasks for defects, depending on work procedures; but after the initial planning i had a clear path towards achieving the feature so the wrap-up work was also expected in my head.

## Installation

```bash
npm install
npm run dev
```

This will start a simple dev server with hot reload using vite and express for some mock API requests.

## API

You find the express API under `src/server`. A file upload API is provided. You can use it and/or modify it to your needs.

### List of files

```http
GET /api/files
```

### Upload a single file

```http
POST /api/upload-single
```

| Body parameter | Type   | Description                      |
| :------------- | :----- | :------------------------------- |
| `file`         | `file` | **Required**. The file to upload |

### Upload a file in chunks

```http
POST /api/upload-chunks
```

| Body parameter      | Type     | Description                                  |
| :------------------ | :------- | :------------------------------------------- |
| `file`              | `file`   | **Required**. The file to upload             |
| `currentChunkIndex` | `number` | **Required**. The current chunk index number |
| `totalChunks`       | `number` | **Required**. The total number of chunks     |

## Styling

The boilerplate provides Tailwind CSS by default. If you want to use something else, feel free to add it.

## Testing

Vitest is provided by default for testing, however you are free to use whatever you like and are familiar with.
