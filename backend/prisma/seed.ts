import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data ──
  await prisma.assessmentAttempt.deleteMany();
  await prisma.application.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.roadmapModule.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.skill.deleteMany();

  // ── Skills ──
  const skillsData = [
    { name: 'Python', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'HTML', category: 'Web' },
    { name: 'CSS', category: 'Web' },
    { name: 'React', category: 'Web' },
    { name: 'SQL', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Data Structures', category: 'CS Fundamentals' },
    { name: 'APIs', category: 'Backend' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'NumPy', category: 'Data Science' },
    { name: 'Pandas', category: 'Data Science' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'TypeScript', category: 'Programming' },
  ];

  const skills: Record<string, string> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.create({ data: s });
    skills[s.name] = skill.id;
  }
  console.log(`  ✓ ${Object.keys(skills).length} skills`);

  // ── Goals ──
  const goalsData = [
    { name: 'Become a Web Developer', description: 'Master HTML, CSS, JavaScript, React, and backend technologies to build full-stack web applications.' },
    { name: 'Become an AI Engineer', description: 'Learn Python, data science, machine learning, and deep learning to build intelligent systems.' },
    { name: 'Learn Python', description: 'Master Python programming from fundamentals to advanced concepts.' },
    { name: 'Learn DSA', description: 'Build strong problem-solving skills with data structures and algorithms.' },
    { name: 'Prepare for Internships', description: 'Build a portfolio, develop technical skills, and practice interviews to land internship opportunities.' },
    { name: 'Prepare for Hackathons', description: 'Learn rapid prototyping, teamwork, and full-stack development for competitive hackathons.' },
    { name: 'Learn Cybersecurity', description: 'Understand network security, ethical hacking, and security best practices.' },
  ];

  const goals: Record<string, string> = {};
  for (const g of goalsData) {
    const goal = await prisma.goal.create({ data: g });
    goals[g.name] = goal.id;
  }
  console.log(`  ✓ ${Object.keys(goals).length} goals`);

  // ── Roadmaps ──

  // Python Developer
  const pythonRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Python Developer',
      description: 'Complete path from Python basics to building real projects.',
      goalId: goals['Learn Python'],
    },
  });

  const pythonModules = [
    { title: 'Python Fundamentals', description: 'Variables, data types, operators, and basic I/O.', order: 1, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['Python'] },
    { title: 'Control Flow', description: 'Conditionals, loops, and control statements.', order: 2, difficulty: 'beginner', estimatedMinutes: 90, skillId: skills['Python'] },
    { title: 'Functions', description: 'Defining functions, parameters, return values, and scope.', order: 3, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['Python'] },
    { title: 'Object-Oriented Programming', description: 'Classes, objects, inheritance, and polymorphism in Python.', order: 4, difficulty: 'intermediate', estimatedMinutes: 180, skillId: skills['Python'] },
    { title: 'File Handling', description: 'Reading, writing files, CSV, and JSON processing.', order: 5, difficulty: 'intermediate', estimatedMinutes: 90, skillId: skills['Python'] },
    { title: 'Git Fundamentals', description: 'Version control with Git: commits, branches, and collaboration.', order: 6, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['Git'] },
    { title: 'Python Projects', description: 'Build real-world Python projects.', order: 7, difficulty: 'intermediate', estimatedMinutes: 300, skillId: skills['Python'] },
  ];

  const pythonModuleRecords: Record<string, string> = {};
  for (const m of pythonModules) {
    const mod = await prisma.roadmapModule.create({
      data: { ...m, roadmapId: pythonRoadmap.id },
    });
    pythonModuleRecords[m.title] = mod.id;
  }

  // Web Developer
  const webRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Web Developer',
      description: 'Full-stack web development from HTML to deployment.',
      goalId: goals['Become a Web Developer'],
    },
  });

  const webModules = [
    { title: 'HTML Foundations', description: 'HTML structure, semantic elements, and forms.', order: 1, difficulty: 'beginner', estimatedMinutes: 90, skillId: skills['HTML'] },
    { title: 'CSS Styling', description: 'CSS selectors, layout, flexbox, and grid.', order: 2, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['CSS'] },
    { title: 'JavaScript Essentials', description: 'Variables, functions, DOM manipulation, and events.', order: 3, difficulty: 'beginner', estimatedMinutes: 180, skillId: skills['JavaScript'] },
    { title: 'Git for Web Development', description: 'Version control, branching strategies, and GitHub.', order: 4, difficulty: 'beginner', estimatedMinutes: 90, skillId: skills['Git'] },
    { title: 'React Fundamentals', description: 'Components, props, state, hooks, and routing.', order: 5, difficulty: 'intermediate', estimatedMinutes: 240, skillId: skills['React'] },
    { title: 'Working with APIs', description: 'Fetch, async/await, REST APIs, and error handling.', order: 6, difficulty: 'intermediate', estimatedMinutes: 120, skillId: skills['APIs'] },
    { title: 'Backend with Node.js', description: 'Express, middleware, routing, and database integration.', order: 7, difficulty: 'intermediate', estimatedMinutes: 180, skillId: skills['Node.js'] },
    { title: 'Database Fundamentals', description: 'SQL basics, schema design, and ORMs.', order: 8, difficulty: 'intermediate', estimatedMinutes: 150, skillId: skills['SQL'] },
    { title: 'Web Projects', description: 'Build and deploy complete web applications.', order: 9, difficulty: 'advanced', estimatedMinutes: 360, skillId: skills['React'] },
  ];

  const webModuleRecords: Record<string, string> = {};
  for (const m of webModules) {
    const mod = await prisma.roadmapModule.create({
      data: { ...m, roadmapId: webRoadmap.id },
    });
    webModuleRecords[m.title] = mod.id;
  }

  // AI/ML Beginner
  const aiRoadmap = await prisma.roadmap.create({
    data: {
      title: 'AI/ML Beginner',
      description: 'Start your journey into artificial intelligence and machine learning.',
      goalId: goals['Become an AI Engineer'],
    },
  });

  const aiModules = [
    { title: 'Python for AI', description: 'Python programming essentials for data science.', order: 1, difficulty: 'beginner', estimatedMinutes: 180, skillId: skills['Python'] },
    { title: 'NumPy Basics', description: 'Numerical computing with NumPy arrays.', order: 2, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['NumPy'] },
    { title: 'Pandas for Data', description: 'Data manipulation and analysis with Pandas.', order: 3, difficulty: 'beginner', estimatedMinutes: 150, skillId: skills['Pandas'] },
    { title: 'Data Visualization', description: 'Creating charts and visualizations with Matplotlib.', order: 4, difficulty: 'intermediate', estimatedMinutes: 120, skillId: skills['Python'] },
    { title: 'Statistics Basics', description: 'Probability, distributions, and statistical tests.', order: 5, difficulty: 'intermediate', estimatedMinutes: 180, skillId: skills['Machine Learning'] },
    { title: 'Machine Learning Foundations', description: 'Supervised learning, regression, and classification.', order: 6, difficulty: 'intermediate', estimatedMinutes: 300, skillId: skills['Machine Learning'] },
    { title: 'AI/ML Projects', description: 'Build end-to-end machine learning projects.', order: 7, difficulty: 'advanced', estimatedMinutes: 360, skillId: skills['Machine Learning'] },
  ];

  const aiModuleRecords: Record<string, string> = {};
  for (const m of aiModules) {
    const mod = await prisma.roadmapModule.create({
      data: { ...m, roadmapId: aiRoadmap.id },
    });
    aiModuleRecords[m.title] = mod.id;
  }

  // DSA Beginner
  const dsaRoadmap = await prisma.roadmap.create({
    data: {
      title: 'DSA Beginner',
      description: 'Master data structures and algorithms for technical interviews.',
      goalId: goals['Learn DSA'],
    },
  });

  const dsaModules = [
    { title: 'Time & Space Complexity', description: 'Big O notation and algorithm analysis.', order: 1, difficulty: 'beginner', estimatedMinutes: 90, skillId: skills['Data Structures'] },
    { title: 'Arrays & Strings', description: 'Array operations, string manipulation, and common patterns.', order: 2, difficulty: 'beginner', estimatedMinutes: 120, skillId: skills['Data Structures'] },
    { title: 'Searching Algorithms', description: 'Linear search, binary search, and variations.', order: 3, difficulty: 'beginner', estimatedMinutes: 90, skillId: skills['Data Structures'] },
    { title: 'Sorting Algorithms', description: 'Bubble, selection, insertion, merge, and quick sort.', order: 4, difficulty: 'intermediate', estimatedMinutes: 150, skillId: skills['Data Structures'] },
    { title: 'Linked Lists', description: 'Singly, doubly linked lists, and operations.', order: 5, difficulty: 'intermediate', estimatedMinutes: 120, skillId: skills['Data Structures'] },
    { title: 'Stacks & Queues', description: 'Stack and queue implementations and applications.', order: 6, difficulty: 'intermediate', estimatedMinutes: 120, skillId: skills['Data Structures'] },
    { title: 'Trees', description: 'Binary trees, BST, traversals, and balancing.', order: 7, difficulty: 'advanced', estimatedMinutes: 180, skillId: skills['Data Structures'] },
    { title: 'Graphs', description: 'Graph representations, BFS, DFS, and shortest paths.', order: 8, difficulty: 'advanced', estimatedMinutes: 180, skillId: skills['Data Structures'] },
  ];

  for (const m of dsaModules) {
    await prisma.roadmapModule.create({
      data: { ...m, roadmapId: dsaRoadmap.id },
    });
  }

  console.log('  ✓ 4 roadmaps with modules');

  // ── Resources ──
  const resourcesData = [
    // Python
    { title: 'Python Tutorial for Beginners', description: 'Complete Python tutorial covering all fundamentals.', provider: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', type: 'YOUTUBE' as const, duration: '6h', difficulty: 'beginner', moduleId: pythonModuleRecords['Python Fundamentals'], skillId: skills['Python'] },
    { title: 'Python Official Tutorial', description: 'Official Python documentation tutorial.', provider: 'Python.org', url: 'https://docs.python.org/3/tutorial/', type: 'DOCUMENTATION' as const, duration: '4h', difficulty: 'beginner', moduleId: pythonModuleRecords['Python Fundamentals'], skillId: skills['Python'] },
    { title: 'Python Control Flow', description: 'Learn if statements, loops, and control flow in Python.', provider: 'Corey Schafer', url: 'https://www.youtube.com/watch?v=DZwmZ8Usvnk', type: 'YOUTUBE' as const, duration: '45min', difficulty: 'beginner', moduleId: pythonModuleRecords['Control Flow'], skillId: skills['Python'] },
    { title: 'Python Functions Deep Dive', description: 'Functions, decorators, and closures.', provider: 'Corey Schafer', url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I', type: 'YOUTUBE' as const, duration: '1h', difficulty: 'beginner', moduleId: pythonModuleRecords['Functions'], skillId: skills['Python'] },
    { title: 'Python OOP Tutorial', description: 'Object-oriented programming in Python.', provider: 'Corey Schafer', url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM', type: 'YOUTUBE' as const, duration: '2h', difficulty: 'intermediate', moduleId: pythonModuleRecords['Object-Oriented Programming'], skillId: skills['Python'] },

    // Web Development
    { title: 'HTML Crash Course', description: 'Learn HTML in one video.', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE', type: 'YOUTUBE' as const, duration: '1h', difficulty: 'beginner', moduleId: webModuleRecords['HTML Foundations'], skillId: skills['HTML'] },
    { title: 'MDN HTML Guide', description: 'Official Mozilla HTML documentation.', provider: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'DOCUMENTATION' as const, duration: '3h', difficulty: 'beginner', moduleId: webModuleRecords['HTML Foundations'], skillId: skills['HTML'] },
    { title: 'CSS Flexbox Tutorial', description: 'Master CSS Flexbox layout.', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc', type: 'YOUTUBE' as const, duration: '45min', difficulty: 'beginner', moduleId: webModuleRecords['CSS Styling'], skillId: skills['CSS'] },
    { title: 'JavaScript ES6 Tutorial', description: 'Modern JavaScript features and syntax.', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', type: 'YOUTUBE' as const, duration: '1.5h', difficulty: 'beginner', moduleId: webModuleRecords['JavaScript Essentials'], skillId: skills['JavaScript'] },
    { title: 'MDN JavaScript Guide', description: 'Official JavaScript documentation.', provider: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'DOCUMENTATION' as const, duration: '5h', difficulty: 'beginner', moduleId: webModuleRecords['JavaScript Essentials'], skillId: skills['JavaScript'] },
    { title: 'React Official Tutorial', description: 'Learn React from the official docs.', provider: 'React.dev', url: 'https://react.dev/learn', type: 'DOCUMENTATION' as const, duration: '4h', difficulty: 'intermediate', moduleId: webModuleRecords['React Fundamentals'], skillId: skills['React'] },
    { title: 'Full React Course', description: 'Complete React tutorial for beginners.', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', type: 'YOUTUBE' as const, duration: '12h', difficulty: 'intermediate', moduleId: webModuleRecords['React Fundamentals'], skillId: skills['React'] },

    // Git
    { title: 'Git & GitHub Crash Course', description: 'Learn Git from scratch.', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc', type: 'YOUTUBE' as const, duration: '30min', difficulty: 'beginner', moduleId: pythonModuleRecords['Git Fundamentals'], skillId: skills['Git'] },
    { title: 'Git Official Documentation', description: 'Pro Git book, freely available online.', provider: 'git-scm.com', url: 'https://git-scm.com/doc', type: 'DOCUMENTATION' as const, duration: '3h', difficulty: 'beginner', moduleId: pythonModuleRecords['Git Fundamentals'], skillId: skills['Git'] },
    { title: 'Learn Git Branching', description: 'Interactive Git tutorial in the browser.', provider: 'learngitbranching.js.org', url: 'https://learngitbranching.js.org/', type: 'PRACTICE' as const, duration: '2h', difficulty: 'beginner', moduleId: pythonModuleRecords['Git Fundamentals'], skillId: skills['Git'] },

    // AI/ML
    { title: 'Python for Data Science', description: 'Python essentials for data science workflows.', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', type: 'YOUTUBE' as const, duration: '4h', difficulty: 'beginner', moduleId: aiModuleRecords['Python for AI'], skillId: skills['Python'] },
    { title: 'NumPy Tutorial', description: 'Complete NumPy tutorial for beginners.', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI', type: 'YOUTUBE' as const, duration: '1h', difficulty: 'beginner', moduleId: aiModuleRecords['NumPy Basics'], skillId: skills['NumPy'] },
    { title: 'NumPy Documentation', description: 'Official NumPy documentation and tutorials.', provider: 'NumPy.org', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', type: 'DOCUMENTATION' as const, duration: '2h', difficulty: 'beginner', moduleId: aiModuleRecords['NumPy Basics'], skillId: skills['NumPy'] },
    { title: 'Pandas Tutorial', description: 'Data analysis with Pandas.', provider: 'Corey Schafer', url: 'https://www.youtube.com/watch?v=ZyhVh-qRZPA', type: 'YOUTUBE' as const, duration: '3h', difficulty: 'beginner', moduleId: aiModuleRecords['Pandas for Data'], skillId: skills['Pandas'] },
    { title: 'Pandas Documentation', description: 'Official Pandas getting started tutorials.', provider: 'Pandas.pydata.org', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'DOCUMENTATION' as const, duration: '3h', difficulty: 'beginner', moduleId: aiModuleRecords['Pandas for Data'], skillId: skills['Pandas'] },
    { title: 'Machine Learning Course', description: 'Introduction to machine learning with Python.', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=NWONeJKn6kc', type: 'YOUTUBE' as const, duration: '10h', difficulty: 'intermediate', moduleId: aiModuleRecords['Machine Learning Foundations'], skillId: skills['Machine Learning'] },
    { title: 'Scikit-learn Documentation', description: 'Official scikit-learn tutorials.', provider: 'scikit-learn.org', url: 'https://scikit-learn.org/stable/tutorial/index.html', type: 'DOCUMENTATION' as const, duration: '4h', difficulty: 'intermediate', moduleId: aiModuleRecords['Machine Learning Foundations'], skillId: skills['Machine Learning'] },

    // DSA
    { title: 'Data Structures Full Course', description: 'Complete data structures tutorial.', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'YOUTUBE' as const, duration: '8h', difficulty: 'intermediate', skillId: skills['Data Structures'] },
    { title: 'Big O Notation Explained', description: 'Understanding time and space complexity.', provider: 'CS Dojo', url: 'https://www.youtube.com/watch?v=v4cd1O4zkGw', type: 'YOUTUBE' as const, duration: '20min', difficulty: 'beginner', skillId: skills['Data Structures'] },

    // APIs
    { title: 'REST API Concepts', description: 'Understanding REST API principles.', provider: 'Traversy Media', url: 'https://www.youtube.com/watch?v=Q-BpqyOT3a8', type: 'YOUTUBE' as const, duration: '20min', difficulty: 'beginner', moduleId: webModuleRecords['Working with APIs'], skillId: skills['APIs'] },
    { title: 'MDN Fetch API Guide', description: 'Using the Fetch API for HTTP requests.', provider: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', type: 'DOCUMENTATION' as const, duration: '1h', difficulty: 'beginner', moduleId: webModuleRecords['Working with APIs'], skillId: skills['APIs'] },

    // SQL
    { title: 'SQL Tutorial for Beginners', description: 'Learn SQL in one video.', provider: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', type: 'YOUTUBE' as const, duration: '3h', difficulty: 'beginner', moduleId: webModuleRecords['Database Fundamentals'], skillId: skills['SQL'] },

    // Node.js
    { title: 'Node.js Tutorial for Beginners', description: 'Learn Node.js and Express.', provider: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', type: 'YOUTUBE' as const, duration: '1h', difficulty: 'intermediate', moduleId: webModuleRecords['Backend with Node.js'], skillId: skills['Node.js'] },
    { title: 'Express.js Documentation', description: 'Official Express.js getting started guide.', provider: 'expressjs.com', url: 'https://expressjs.com/en/starter/installing.html', type: 'DOCUMENTATION' as const, duration: '2h', difficulty: 'intermediate', moduleId: webModuleRecords['Backend with Node.js'], skillId: skills['Node.js'] },

    // GitHub repos
    { title: 'freeCodeCamp Curriculum', description: 'Free full-stack curriculum with projects.', provider: 'freeCodeCamp', url: 'https://github.com/freeCodeCamp/freeCodeCamp', type: 'GITHUB' as const, duration: '100h+', difficulty: 'beginner', skillId: skills['JavaScript'] },
    { title: 'The Algorithms - Python', description: 'Collection of algorithms implemented in Python.', provider: 'The Algorithms', url: 'https://github.com/TheAlgorithms/Python', type: 'GITHUB' as const, duration: '20h+', difficulty: 'intermediate', skillId: skills['Python'] },
  ];

  for (const r of resourcesData) {
    await prisma.resource.create({ data: r });
  }
  console.log(`  ✓ ${resourcesData.length} resources`);

  // ── Assessments & Questions ──

  // Python Assessment
  const pythonAssessment = await prisma.assessment.create({
    data: {
      title: 'Python Fundamentals Assessment',
      description: 'Test your knowledge of Python basics.',
      moduleId: pythonModuleRecords['Python Fundamentals'],
      skillId: skills['Python'],
    },
  });

  const pythonQuestions = [
    { question: 'What is the output of print(type(5))?', options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'number'>"], correctAnswer: 0, explanation: "In Python, 5 is an integer, so type(5) returns <class 'int'>.", difficulty: 'beginner', skillId: skills['Python'] },
    { question: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctAnswer: 1, explanation: "The 'def' keyword is used to define functions in Python.", difficulty: 'beginner', skillId: skills['Python'] },
    { question: 'What does len([1, 2, 3]) return?', options: ['2', '3', '4', 'Error'], correctAnswer: 1, explanation: 'len() returns the number of items in the list, which is 3.', difficulty: 'beginner', skillId: skills['Python'] },
    { question: 'Which of the following is a mutable data type in Python?', options: ['tuple', 'string', 'list', 'frozenset'], correctAnswer: 2, explanation: 'Lists are mutable in Python — you can modify their elements.', difficulty: 'beginner', skillId: skills['Python'] },
    { question: 'What is the correct way to create a dictionary?', options: ["d = {1, 2, 3}", "d = {'a': 1, 'b': 2}", "d = [1, 2, 3]", "d = (1, 2, 3)"], correctAnswer: 1, explanation: "Dictionaries use curly braces with key-value pairs separated by colons.", difficulty: 'beginner', skillId: skills['Python'] },
  ];

  for (const q of pythonQuestions) {
    await prisma.question.create({
      data: { ...q, assessmentId: pythonAssessment.id },
    });
  }

  // JavaScript Assessment
  const jsAssessment = await prisma.assessment.create({
    data: {
      title: 'JavaScript Essentials Assessment',
      description: 'Test your knowledge of JavaScript fundamentals.',
      moduleId: webModuleRecords['JavaScript Essentials'],
      skillId: skills['JavaScript'],
    },
  });

  const jsQuestions = [
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 3, explanation: "Both 'let' and 'const' are block-scoped. 'var' is function-scoped.", difficulty: 'beginner', skillId: skills['JavaScript'] },
    { question: 'What does === check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 2, explanation: "The === operator checks both value and type (strict equality).", difficulty: 'beginner', skillId: skills['JavaScript'] },
    { question: 'What is the output of typeof null?', options: ["'null'", "'undefined'", "'object'", "'boolean'"], correctAnswer: 2, explanation: "typeof null returns 'object'. This is a known quirk in JavaScript.", difficulty: 'intermediate', skillId: skills['JavaScript'] },
    { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctAnswer: 0, explanation: "push() adds elements to the end. pop() removes from the end.", difficulty: 'beginner', skillId: skills['JavaScript'] },
    { question: 'What does the map() method return?', options: ['The original array', 'A new array', 'undefined', 'A boolean'], correctAnswer: 1, explanation: "map() creates and returns a new array with the results of the callback.", difficulty: 'intermediate', skillId: skills['JavaScript'] },
  ];

  for (const q of jsQuestions) {
    await prisma.question.create({
      data: { ...q, assessmentId: jsAssessment.id },
    });
  }

  // Git Assessment
  const gitAssessment = await prisma.assessment.create({
    data: {
      title: 'Git Fundamentals Assessment',
      description: 'Test your knowledge of Git version control.',
      moduleId: pythonModuleRecords['Git Fundamentals'],
      skillId: skills['Git'],
    },
  });

  const gitQuestions = [
    { question: 'What command creates a new Git repository?', options: ['git start', 'git init', 'git create', 'git new'], correctAnswer: 1, explanation: "'git init' initializes a new Git repository in the current directory.", difficulty: 'beginner', skillId: skills['Git'] },
    { question: 'What does git clone do?', options: ['Creates a branch', 'Copies a remote repository', 'Merges branches', 'Stages files'], correctAnswer: 1, explanation: "'git clone' creates a local copy of a remote repository.", difficulty: 'beginner', skillId: skills['Git'] },
    { question: 'Which command stages files for commit?', options: ['git stage', 'git add', 'git commit', 'git push'], correctAnswer: 1, explanation: "'git add' stages changes for the next commit.", difficulty: 'beginner', skillId: skills['Git'] },
    { question: 'What does git pull do?', options: ['Pushes local changes', 'Fetches and merges remote changes', 'Creates a branch', 'Deletes a branch'], correctAnswer: 1, explanation: "'git pull' fetches changes from the remote and merges them.", difficulty: 'beginner', skillId: skills['Git'] },
    { question: 'True or False: git commit saves changes to the remote repository.', options: ['True', 'False'], correctAnswer: 1, explanation: "'git commit' saves to your local repository. 'git push' sends to remote.", difficulty: 'beginner', skillId: skills['Git'] },
  ];

  for (const q of gitQuestions) {
    await prisma.question.create({
      data: { ...q, assessmentId: gitAssessment.id },
    });
  }

  // DSA Assessment
  const dsaAssessment = await prisma.assessment.create({
    data: {
      title: 'Data Structures Basics Assessment',
      description: 'Test your understanding of basic data structures.',
      skillId: skills['Data Structures'],
    },
  });

  const dsaQuestions = [
    { question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 0, explanation: "Array index access is O(1) — constant time.", difficulty: 'beginner', skillId: skills['Data Structures'] },
    { question: 'Which data structure uses LIFO (Last In, First Out)?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 1, explanation: "A stack follows LIFO — the last element added is removed first.", difficulty: 'beginner', skillId: skills['Data Structures'] },
    { question: 'What is the worst-case time complexity of binary search?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctAnswer: 2, explanation: "Binary search halves the search space each step, giving O(log n).", difficulty: 'intermediate', skillId: skills['Data Structures'] },
    { question: 'Which sorting algorithm has O(n log n) average time complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correctAnswer: 2, explanation: "Merge Sort consistently performs in O(n log n).", difficulty: 'intermediate', skillId: skills['Data Structures'] },
    { question: 'In a singly linked list, what does each node contain?', options: ['Only data', 'Data and a pointer to the next node', 'Data and pointers to next and previous', 'Only a pointer'], correctAnswer: 1, explanation: "Each node in a singly linked list has data and a reference to the next node.", difficulty: 'beginner', skillId: skills['Data Structures'] },
  ];

  for (const q of dsaQuestions) {
    await prisma.question.create({
      data: { ...q, assessmentId: dsaAssessment.id },
    });
  }

  // ML Assessment
  const mlAssessment = await prisma.assessment.create({
    data: {
      title: 'Machine Learning Basics Assessment',
      description: 'Test your understanding of ML fundamentals.',
      moduleId: aiModuleRecords['Machine Learning Foundations'],
      skillId: skills['Machine Learning'],
    },
  });

  const mlQuestions = [
    { question: 'What type of learning uses labeled data?', options: ['Unsupervised', 'Supervised', 'Reinforcement', 'Semi-supervised'], correctAnswer: 1, explanation: "Supervised learning uses labeled training data to learn mappings from inputs to outputs.", difficulty: 'beginner', skillId: skills['Machine Learning'] },
    { question: 'Which algorithm is commonly used for classification?', options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'PCA'], correctAnswer: 2, explanation: "Logistic Regression is used for classification despite its name.", difficulty: 'beginner', skillId: skills['Machine Learning'] },
    { question: 'What is overfitting?', options: ['Model performs well on training and test data', 'Model performs well on training but poorly on test data', 'Model performs poorly on all data', 'Model ignores the training data'], correctAnswer: 1, explanation: "Overfitting means the model memorizes training data but fails to generalize.", difficulty: 'intermediate', skillId: skills['Machine Learning'] },
    { question: 'What does a confusion matrix show?', options: ['Feature importance', 'Training time', 'True/false positives and negatives', 'Learning rate'], correctAnswer: 2, explanation: "A confusion matrix shows TP, TN, FP, and FN counts for classification.", difficulty: 'intermediate', skillId: skills['Machine Learning'] },
    { question: 'Which technique helps prevent overfitting?', options: ['Adding more features', 'Regularization', 'Increasing model complexity', 'Removing validation set'], correctAnswer: 1, explanation: "Regularization (L1/L2) penalizes complexity to prevent overfitting.", difficulty: 'intermediate', skillId: skills['Machine Learning'] },
  ];

  for (const q of mlQuestions) {
    await prisma.question.create({
      data: { ...q, assessmentId: mlAssessment.id },
    });
  }

  console.log('  ✓ 5 assessments with 25 questions');

  // ── Opportunities ──
  const now = new Date();
  const days = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const opportunitiesData = [
    { title: 'AI Innovation Hackathon', organization: 'TechCommunity', description: 'Build innovative AI solutions in 48 hours. Open to all undergraduate students. Teams of 2-4 members.', category: 'HACKATHON' as const, eligibility: 'Undergraduate students, all years', deadline: days(5), eventDate: days(14), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/ai-hackathon', skillIds: [skills['Python'], skills['Machine Learning'], skills['Git']] },
    { title: 'Web Dev Sprint', organization: 'DevFest', description: 'A 24-hour web development hackathon. Build something amazing using modern web technologies.', category: 'HACKATHON' as const, eligibility: 'Open to all students', deadline: days(10), eventDate: days(20), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/web-sprint', skillIds: [skills['JavaScript'], skills['React'], skills['HTML'], skills['CSS']] },
    { title: 'Code Arena Championship', organization: 'CompetitiveProgramming.io', description: 'National competitive programming contest. Solve algorithmic challenges and win prizes.', category: 'COMPETITION' as const, eligibility: 'Undergraduate students, all years', deadline: days(15), eventDate: days(25), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/code-arena', skillIds: [skills['Data Structures'], skills['Python'], skills['Java']] },
    { title: 'Frontend Developer Internship', organization: 'StartupX', description: 'Join our team as a frontend developer intern. Work on real products used by thousands of users.', category: 'INTERNSHIP' as const, eligibility: '2nd year and above', deadline: days(7), location: 'Bangalore, India', mode: 'hybrid', cost: 'Paid', applyUrl: 'https://example.com/frontend-intern', skillIds: [skills['React'], skills['JavaScript'], skills['CSS'], skills['Git']] },
    { title: 'Python Developer Internship', organization: 'DataCorp', description: 'Work on backend services and data pipelines using Python. 3-month remote internship.', category: 'INTERNSHIP' as const, eligibility: 'All years, CS/IT students', deadline: days(12), location: 'Remote', mode: 'online', cost: 'Paid', applyUrl: 'https://example.com/python-intern', skillIds: [skills['Python'], skills['SQL'], skills['APIs'], skills['Git']] },
    { title: 'ML Research Internship', organization: 'AI Lab University', description: 'Research internship in machine learning. Work on cutting-edge NLP projects.', category: 'INTERNSHIP' as const, eligibility: '3rd year and above', deadline: days(20), location: 'Delhi, India', mode: 'offline', cost: 'Paid', applyUrl: 'https://example.com/ml-research', skillIds: [skills['Python'], skills['Machine Learning'], skills['NumPy'], skills['Pandas']] },
    { title: 'STEM Excellence Scholarship', organization: 'Education Foundation', description: 'Scholarship for outstanding STEM students. Covers tuition and provides a monthly stipend.', category: 'SCHOLARSHIP' as const, eligibility: 'Undergraduate students with GPA > 8.0', deadline: days(30), location: 'India', mode: 'offline', cost: 'Free', applyUrl: 'https://example.com/stem-scholarship', skillIds: [skills['Python'], skills['Data Structures']] },
    { title: 'Women in Tech Scholarship', organization: 'TechDiversity', description: 'Supporting women in technology with funding and mentorship opportunities.', category: 'SCHOLARSHIP' as const, eligibility: 'Female undergraduate students', deadline: days(45), location: 'Global', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/wit-scholarship', skillIds: [skills['Python'], skills['JavaScript']] },
    { title: 'React Workshop: Building Modern UIs', organization: 'WebDev Community', description: 'Hands-on workshop on building modern user interfaces with React and TypeScript.', category: 'WORKSHOP' as const, eligibility: 'Students with basic HTML/CSS knowledge', deadline: days(3), eventDate: days(8), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/react-workshop', skillIds: [skills['React'], skills['JavaScript'], skills['TypeScript']] },
    { title: 'Cloud Computing Workshop', organization: 'CloudExperts', description: 'Learn cloud fundamentals with hands-on AWS/GCP projects.', category: 'WORKSHOP' as const, eligibility: 'All students', deadline: days(18), eventDate: days(22), location: 'Online', mode: 'online', cost: '₹200', applyUrl: 'https://example.com/cloud-workshop', skillIds: [skills['Python'], skills['APIs']] },
    { title: 'Full-Stack Web Development Course', organization: 'CodeAcademy Pro', description: 'Comprehensive 12-week full-stack web development course with projects and certification.', category: 'COURSE' as const, eligibility: 'Anyone with basic programming knowledge', deadline: days(25), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/fullstack-course', skillIds: [skills['JavaScript'], skills['React'], skills['Node.js'], skills['SQL']] },
    { title: 'Data Science with Python', organization: 'DataLearn', description: '8-week data science bootcamp covering Python, Pandas, ML, and visualization.', category: 'COURSE' as const, eligibility: 'Students with Python basics', deadline: days(35), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/ds-course', skillIds: [skills['Python'], skills['NumPy'], skills['Pandas'], skills['Machine Learning']] },
    { title: 'AWS Certified Cloud Practitioner', organization: 'AWS', description: 'Prepare for and obtain the AWS Cloud Practitioner certification.', category: 'CERTIFICATION' as const, eligibility: 'All students', deadline: days(60), location: 'Online', mode: 'online', cost: '$100', applyUrl: 'https://example.com/aws-cert', skillIds: [skills['APIs'], skills['Python']] },
    { title: 'Google IT Support Certificate', organization: 'Google', description: 'Professional certificate program in IT support fundamentals.', category: 'CERTIFICATION' as const, eligibility: 'No prerequisites', deadline: days(90), location: 'Online', mode: 'online', cost: 'Free (with Coursera)', applyUrl: 'https://example.com/google-it', skillIds: [skills['Python'], skills['Git']] },
    { title: 'Undergraduate Research in NLP', organization: 'CS Department', description: 'Research opportunity in natural language processing. Work on sentiment analysis and text classification.', category: 'RESEARCH' as const, eligibility: '2nd year and above, ML knowledge required', deadline: days(28), location: 'Campus', mode: 'offline', cost: 'Stipend provided', applyUrl: 'https://example.com/nlp-research', skillIds: [skills['Python'], skills['Machine Learning']] },
    { title: 'Open Source Contribution Drive', organization: 'OpenSourceClub', description: 'Contribute to popular open source projects. Mentorship provided for beginners.', category: 'HACKATHON' as const, eligibility: 'All students', deadline: days(4), eventDate: days(10), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/opensource', skillIds: [skills['Git'], skills['Python'], skills['JavaScript']] },
    { title: 'Database Design Competition', organization: 'TechForum', description: 'Design the most efficient database schema for a given problem statement.', category: 'COMPETITION' as const, eligibility: 'Students with SQL knowledge', deadline: days(22), eventDate: days(30), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/db-comp', skillIds: [skills['SQL'], skills['Data Structures']] },
    { title: 'Cybersecurity CTF Challenge', organization: 'SecureTech', description: 'Capture the flag competition. Test your security skills across web, crypto, and forensics.', category: 'COMPETITION' as const, eligibility: 'All students', deadline: days(8), eventDate: days(15), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/ctf', skillIds: [skills['Python'], skills['APIs']] },
    { title: 'Node.js Backend Masterclass', organization: 'BackendPro', description: 'Learn to build production-ready APIs with Node.js, Express, and PostgreSQL.', category: 'WORKSHOP' as const, eligibility: 'Students with JavaScript basics', deadline: days(16), eventDate: days(20), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/nodejs-workshop', skillIds: [skills['Node.js'], skills['JavaScript'], skills['SQL'], skills['APIs']] },
    { title: 'Summer of Code Program', organization: 'TechOrg', description: 'Summer coding program where students work on real-world open source projects with mentors.', category: 'INTERNSHIP' as const, eligibility: 'Undergraduate students, all years', deadline: days(40), eventDate: days(60), location: 'Remote', mode: 'online', cost: 'Stipend provided', applyUrl: 'https://example.com/summer-code', skillIds: [skills['Python'], skills['JavaScript'], skills['Git'], skills['APIs']] },
    { title: 'Data Visualization Challenge', organization: 'VizHub', description: 'Create the best data visualization from a provided dataset. Tools of your choice.', category: 'COMPETITION' as const, eligibility: 'All students', deadline: days(18), eventDate: days(25), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/viz-challenge', skillIds: [skills['Python'], skills['Pandas']] },
    { title: 'Java Developer Internship', organization: 'Enterprise Solutions', description: 'Build enterprise applications using Java and Spring Boot. 6-month internship.', category: 'INTERNSHIP' as const, eligibility: '3rd year, CS/IT students', deadline: days(14), location: 'Mumbai, India', mode: 'hybrid', cost: 'Paid', applyUrl: 'https://example.com/java-intern', skillIds: [skills['Java'], skills['SQL'], skills['APIs'], skills['Git']] },
    { title: 'AI Ethics Research Program', organization: 'Ethics in Tech Institute', description: 'Interdisciplinary research on ethical implications of AI systems.', category: 'RESEARCH' as const, eligibility: 'All undergraduate students', deadline: days(50), location: 'Online', mode: 'online', cost: 'Stipend provided', applyUrl: 'https://example.com/ai-ethics', skillIds: [skills['Python'], skills['Machine Learning'], skills['Communication']] },
    { title: 'TypeScript Fundamentals Workshop', organization: 'TypeScript Community', description: 'Learn TypeScript from scratch. Migrate existing JavaScript projects to TypeScript.', category: 'WORKSHOP' as const, eligibility: 'Students with JavaScript knowledge', deadline: days(11), eventDate: days(14), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/ts-workshop', skillIds: [skills['TypeScript'], skills['JavaScript']] },
    { title: 'Git & GitHub Bootcamp', organization: 'DevCommunity', description: 'Master Git version control and GitHub collaboration workflows.', category: 'WORKSHOP' as const, eligibility: 'All students, no prerequisites', deadline: days(6), eventDate: days(9), location: 'Online', mode: 'online', cost: 'Free', applyUrl: 'https://example.com/git-bootcamp', skillIds: [skills['Git']] },
  ];

  for (const opp of opportunitiesData) {
    const { skillIds, ...oppData } = opp;
    const created = await prisma.opportunity.create({
      data: {
        ...oppData,
        isDemo: true,
        isPublished: true,
        skills: {
          create: skillIds.map((skillId: string) => ({ skillId })),
        },
      },
    });
  }
  console.log(`  ✓ ${opportunitiesData.length} opportunities`);

  // ── Demo Users ──
  const hashedPassword = await bcrypt.hash('demo1234', 12);
  const adminPassword = await bcrypt.hash('admin1234', 12);

  // Demo Student
  const demoStudent = await prisma.user.create({
    data: {
      name: 'Demo Student',
      email: 'demo@student.local',
      password: hashedPassword,
      role: 'STUDENT',
      profile: {
        create: {
          college: 'Demo Institute of Technology',
          degree: 'B.Tech',
          branch: 'Computer Science',
          year: 2,
          goalId: goals['Become an AI Engineer'],
          interests: ['AI', 'Hackathons', 'Internships', 'Data Science', 'Web Development'],
        },
      },
    },
  });

  // Set demo student skills with varying confidence levels
  const demoSkills = [
    { skillId: skills['Python'], confidence: 82, assessmentScore: 90, learningScore: 60 },
    { skillId: skills['Java'], confidence: 50, assessmentScore: 55, learningScore: 30 },
    { skillId: skills['Git'], confidence: 74, assessmentScore: 80, learningScore: 50 },
    { skillId: skills['SQL'], confidence: 61, assessmentScore: 70, learningScore: 30 },
    { skillId: skills['Machine Learning'], confidence: 42, assessmentScore: 45, learningScore: 25 },
    { skillId: skills['APIs'], confidence: 28, assessmentScore: 30, learningScore: 15 },
    { skillId: skills['JavaScript'], confidence: 65, assessmentScore: 70, learningScore: 45 },
    { skillId: skills['HTML'], confidence: 78, assessmentScore: 85, learningScore: 55 },
    { skillId: skills['Data Structures'], confidence: 55, assessmentScore: 60, learningScore: 35 },
  ];

  for (const s of demoSkills) {
    await prisma.studentSkill.create({
      data: { userId: demoStudent.id, ...s },
    });
  }

  // Demo Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@pathforge.local',
      password: adminPassword,
      role: 'ADMIN',
      profile: { create: {} },
    },
  });

  console.log('  ✓ Demo student (demo@student.local / demo1234)');
  console.log('  ✓ Admin user (admin@pathforge.local / admin1234)');
  console.log('');
  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
