1. Go to firebase console
2. Open a project name ExpenseMarker
3. Add android project with name "com.expensemarker"
-  that's name is the namespace inside file located at "/android/app/build.gradle"
4. Download google-services.json, put it inside "/android/app"
5. Go to firebase console - Authentication
6. Enable using email login
7. Add a user, mark email and password 
8. Create folder name "authentication" inside "/src"
9. Create file name "authentication" with tsx file type
10. Add following content inside the file and replace xxxx with actual email and password
export const Authentication = Object.freeze({
    email: 'xxxxxxxxxxx',
    password: 'xxxxxxxxxxx',
});
11. Type yarn build in terminal, and get the apk located at (at default) 
- C:\Users\User\Desktop\project\ExpenseMarker\android\app\build\outputs\apk\release