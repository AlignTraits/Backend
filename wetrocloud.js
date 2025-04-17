// Calling Wetrocloud categorize API

    Data sent to Wetrocloud AI: {
  "resource": "[{\"question\":\"When learning something new, do you prefer\",\"answer\":\"Practical, hands-on experience\"},{\"question\":\"When working on a group project, do you\",\"answer\":\"Prefer structured plans and clear goals\"},{\"question\":\"How do you approach challenges at work\",\"answer\":\"Take control and solve problems quickly\"}]",
  "type": "text",
  "json_schema": {
    "career_path": "",
    "reason": ""
  },
  "categories": [
    "Engineering",
    "Data Science",
    "IT",
    "Psychology",
    "Social Work",
    "Law",
    "Finance",
    "Marketing",
    "Startups",
    "HR",
    "Teaching"
  ],
  "prompt": "\n          Analyze these career assessment responses and recommend the best career path:\n          [\n  {\n    \"question\": 
\"When learning something new, do you prefer\",\n    \"answer\": \"Practical, hands-on experience\"\n  },\n  {\n    \"question\": \"When working on a group project, do you\",\n    \"answer\": \"Prefer structured plans and clear goals\"\n  },\n  {\n    \"question\": \"How do you approach challenges at work\",\n    \"answer\": \"Take control and solve problems quickly\"\n  }\n]\n          \n          Consider:\n       
   - Skills and interests shown\n          - Personality traits revealed\n          - Work style preferences\n          - Long-term career goals\n          \n          Return JSON with:\n          - career_path: The recommended career\n          - reason: Detailed explanation including required skills\n        "
}
{
  "message": "getaddrinfo EAI_AGAIN api.wetrocloud.com",
  "name": "Error",
  "stack": "Error: getaddrinfo EAI_AGAIN api.wetrocloud.com\n    at Function.AxiosError.from (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\node_modules\\axios\\lib\\core\\AxiosError.js:92:14)\n    at RedirectableRequest.handleRequestError (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\node_modules\\axios\\lib\\adapters\\http.js:620:25)\n    at RedirectableRequest.emit (node:events:519:28)\n    at eventHandlers.<computed> (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\node_modules\\follow-redirects\\index.js:49:24)\n    at ClientRequest.emit (node:events:519:28)\n    at TLSSocket.socketErrorListener (node:_http_client:500:9)\n    at TLSSocket.emit (node:events:519:28)\n 
   at emitErrorNT (node:internal/streams/destroy:169:8)\n    at emitErrorCloseNT (node:internal/streams/destroy:128:3)\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)\n    at Axios.request (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\node_modules\\axios\\lib\\core\\Axios.js:45:41)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at Wetrocloud.categorize (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\node_modules\\wetro-sdk\\dist\\cjs\\src\\index.js:402:25)\n    at 
calculateCareerPath (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\src\\services\\careerPathService.ts:217:25)\n    at submitAnswersService (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\src\\services\\careerPathService.ts:305:12)\n    at submitCareerAnswers (C:\\Users\\Julius\\Desktop\\ESM-Aligntrait\\Backend\\src\\controllers\\careerPathController.ts:17:20)",
  "config": {
    "transitional": {
      "silentJSONParsing": true,
      "forcedJSONParsing": true,
      "clarifyTimeoutError": false
    },
    "adapter": [
      "xhr",
      "http",
      "fetch"
    ],
    "transformRequest": [
      null
    ],
    "transformResponse": [
      null
    ],
    "timeout": 0,
    "xsrfCookieName": "XSRF-TOKEN",
    "xsrfHeaderName": "X-XSRF-TOKEN",
    "maxContentLength": -1,
    "maxBodyLength": -1,
    "env": {},
    "headers": {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "Authorization": "Token wtc-sk-d74438b502aaa92675a8d779072e2700d3a55ef7",
      "User-Agent": "axios/1.8.4",
      "Content-Length": "1422",
      "Accept-Encoding": "gzip, compress, deflate, br"
    },
    "baseURL": "https://api.wetrocloud.com/v1",
    "url": "/categorize/?referrer=node_sdk",
    "method": "post",
    "data": "{\"resource\":\"[{\\\"question\\\":\\\"When learning something new, do you prefer\\\",\\\"answer\\\":\\\"Practical, hands-on experience\\\"},{\\\"question\\\":\\\"When working on a group project, do you\\\",\\\"answer\\\":\\\"Prefer structured plans and clear goals\\\"},{\\\"question\\\":\\\"How do you approach challenges at work\\\",\\\"answer\\\":\\\"Take control and solve problems quickly\\\"}]\",\"type\":\"text\",\"json_schema\":\"{\\\"career_path\\\":\\\"\\\",\\\"reason\\\":\\\"\\\"}\",\"categories\":[\"Engineering\",\"Data Science\",\"IT\",\"Psychology\",\"Social Work\",\"Law\",\"Finance\",\"Marketing\",\"Startups\",\"HR\",\"Teaching\"],\"prompt\":\"\\n          Analyze these career assessment responses and recommend the best career path:\\n          [\\n  {\\n    \\\"question\\\": \\\"When learning something 
new, do you prefer\\\",\\n    \\\"answer\\\": \\\"Practical, hands-on experience\\\"\\n  },\\n  {\\n    \\\"question\\\": \\\"When working on a group project, do you\\\",\\n    \\\"answer\\\": \\\"Prefer structured plans and clear goals\\\"\\n  },\\n  {\\n    \\\"question\\\": \\\"How do you approach challenges at work\\\",\\n    \\\"answer\\\": \\\"Take control and solve problems quickly\\\"\\n  }\\n]\\n          \\n          Consider:\\n          - Skills and interests shown\\n          - Personality traits revealed\\n          - Work style preferences\\n          - Long-term career goals\\n          \\n          Return JSON with:\\n          - career_path: The recommended career\\n       
   - reason: Detailed explanation including required skills\\n        \"}",
    "allowAbsoluteUrls": true
  },
  "code": "EAI_AGAIN"
}