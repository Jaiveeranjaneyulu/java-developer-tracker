import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFaP3JnXRAqua3sJszIJz8wucLcn8k1Yo",
  authDomain: "java-developer-tracker.firebaseapp.com",
  projectId: "java-developer-tracker",
  storageBucket: "java-developer-tracker.firebasestorage.app",
  messagingSenderId: "764171855041",
  appId: "1:764171855041:web:d7b1cf6fc9852e31282040"
};

const roadmap = {
  "Core Java": [
    "Java syntax, variables and data types","Operators, conditions and loops","Methods and constructors",
    "Arrays and Strings","OOP: encapsulation, inheritance, polymorphism, abstraction",
    "Interface vs abstract class","static, final, this and super","Access modifiers",
    "Exception handling","Checked vs unchecked exceptions","Custom exceptions"
  ],
  "Collections": [
    "Collection hierarchy","ArrayList","LinkedList","HashSet","LinkedHashSet","TreeSet",
    "HashMap","LinkedHashMap","TreeMap","Queue and PriorityQueue","Iterator",
    "ArrayList vs LinkedList","HashMap internal working","equals() and hashCode()",
    "Comparable vs Comparator"
  ],
  "Java 8+": [
    "Lambda expressions","Functional interfaces","Predicate","Consumer","Function","Supplier",
    "Method references","Stream API","map()","filter()","sorted()","collect()",
    "groupingBy()","reduce()","Optional","Default and static interface methods"
  ],
  "SQL": [
    "SELECT / WHERE / ORDER BY","GROUP BY / HAVING","DISTINCT and aggregate functions",
    "INNER JOIN","LEFT JOIN","RIGHT JOIN","Subqueries","IN / EXISTS","CASE and NULL handling",
    "Primary key and foreign key","Indexes","Normalization","Practice 50 SQL problems"
  ],
  "Spring Core": [
    "IoC","Dependency Injection","Bean","ApplicationContext","@Component","@Service",
    "@Repository","@Controller","Constructor injection","Bean lifecycle basics"
  ],
  "Spring Boot": [
    "Spring Boot fundamentals","Project structure","@SpringBootApplication",
    "application.properties","Profiles","REST controllers","Request mapping",
    "RequestBody / PathVariable / RequestParam","DTOs","Validation",
    "Global exception handling","@ControllerAdvice","Logging"
  ],
  "REST API": [
    "GET / POST / PUT / DELETE","HTTP status codes","Request and response design",
    "CRUD API design","API validation","Error response structure","Postman testing"
  ],
  "JPA / Hibernate": [
    "ORM concept","@Entity / @Id / @GeneratedValue","JpaRepository","CRUD",
    "JPQL basics","OneToOne","OneToMany","ManyToOne","ManyToMany",
    "Lazy vs Eager loading","Transactions"
  ],
  "Git & Build Tools": [
    "git clone / status / add / commit","push / pull","branches","merge",
    "rebase basics","Resolve conflicts",".gitignore","Maven pom.xml",
    "Maven lifecycle","Gradle basics"
  ],
  "Testing": [
    "JUnit 5","Assertions","Unit testing","Mockito","@Mock","@InjectMocks",
    "Service-layer tests","Controller testing basics"
  ],
  "DSA": [
    "Two Sum","Palindrome","Anagram","Character frequency","First non-repeating character",
    "Duplicate detection","Reverse linked list","Detect linked-list cycle","Find middle of linked list",
    "Valid parentheses","Stack and Queue basics","Binary search","Basic sorting algorithms",
    "Complete 50–75 coding problems"
  ],
  "Project": [
    "Create Spring Boot project","Design Controller-Service-Repository layers",
    "Connect MySQL","Implement CRUD","Add DTOs","Add validation","Global exception handling",
    "Add logging","Write unit tests","Push project to GitHub","Write README",
    "Explain project confidently for 15–20 minutes"
  ],
  "Interview Readiness": [
    "Explain OOP with examples","Explain HashMap","Explain Java 8 Streams",
    "Write SQL joins","Build REST API from scratch","Explain JPA relationships",
    "Explain Git workflow","Debug a Spring Boot application","Complete mock interview"
  ]
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let completed = JSON.parse(localStorage.getItem("javaTracker") || "{}");
let currentUser = null;

const $ = id => document.getElementById(id);

function allTopics() {
  return Object.entries(roadmap).flatMap(([section, topics]) =>
    topics.map(topic => ({ section, topic }))
  );
}

function saveLocal() {
  localStorage.setItem("javaTracker", JSON.stringify(completed));
}

async function saveCloud() {
  if (!currentUser) return;
  await setDoc(doc(db, "progress", currentUser.uid), {
    completed,
    updatedAt: new Date().toISOString()
  });
}

async function loadCloud(user) {
  const snap = await getDoc(doc(db, "progress", user.uid));
  if (snap.exists()) {
    completed = snap.data().completed || {};
    saveLocal();
  } else {
    await saveCloud();
  }
}

async function toggleTopic(key, checked) {
  if (checked) completed[key] = true;
  else delete completed[key];

  saveLocal();
  render();

  if (currentUser) {
    try {
      await saveCloud();
      $("syncStatus").textContent = "☁️ Saved to Firebase";
    } catch (error) {
      console.error(error);
      $("syncStatus").textContent = "⚠️ Local save only — Firebase error";
    }
  }
}

async function login() {
  $("loginBtn").disabled = true;
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    $("syncStatus").textContent =
      error.code === "auth/popup-blocked"
        ? "⚠️ Allow popups for this site and try again."
        : `⚠️ Sign-in failed: ${error.message}`;
  } finally {
    $("loginBtn").disabled = false;
  }
}

async function logout() {
  await signOut(auth);
}

function render() {
  const search = $("search").value.toLowerCase().trim();
  const filter = $("filter").value;
  const container = $("roadmap");
  container.innerHTML = "";

  let visible = 0;

  Object.entries(roadmap).forEach(([section, topics]) => {
    const filtered = topics.filter(topic => {
      const key = `${section}::${topic}`;
      const done = !!completed[key];
      return (!search || `${section} ${topic}`.toLowerCase().includes(search))
        && (filter === "all" || (filter === "done" ? done : !done));
    });

    if (!filtered.length) return;

    const card = document.createElement("section");
    card.className = "section";

    const sectionDone = topics.filter(t => completed[`${section}::${t}`]).length;
    card.innerHTML = `<h2>${section}</h2>
      <div class="meta">${sectionDone} / ${topics.length} completed</div>`;

    filtered.forEach(topic => {
      visible++;
      const key = `${section}::${topic}`;
      const row = document.createElement("div");
      row.className = `topic ${completed[key] ? "done" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!completed[key];

      const label = document.createElement("label");
      label.textContent = topic;

      checkbox.addEventListener("change", () =>
        toggleTopic(key, checkbox.checked)
      );

      row.append(checkbox, label);
      card.appendChild(row);
    });

    container.appendChild(card);
  });

  if (!visible) container.innerHTML = `<div class="empty">No matching topics.</div>`;

  const total = allTopics().length;
  const done = allTopics().filter(x => completed[`${x.section}::${x.topic}`]).length;
  const pct = total ? Math.round(done * 100 / total) : 0;

  $("percent").textContent = `${pct}%`;
  $("count").textContent = `${done} / ${total} completed`;
  $("bar").style.width = `${pct}%`;
}

onAuthStateChanged(auth, async user => {
  currentUser = user;

  if (user) {
    $("loginBtn").hidden = true;
    $("logoutBtn").hidden = false;
    $("userName").textContent = user.displayName || user.email || "";
    $("syncStatus").textContent = "☁️ Loading your progress...";

    try {
      await loadCloud(user);
      $("syncStatus").textContent = "☁️ Synced with Firebase";
      render();
    } catch (error) {
      console.error(error);
      $("syncStatus").textContent = "⚠️ Could not load Firebase data";
    }
  } else {
    $("loginBtn").hidden = false;
    $("logoutBtn").hidden = true;
    $("userName").textContent = "";
    $("syncStatus").textContent = "Sign in to sync progress across devices.";
    render();
  }
});

$("loginBtn").addEventListener("click", login);
$("logoutBtn").addEventListener("click", logout);
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

$("resetBtn").addEventListener("click", async () => {
  if (!confirm("Reset all Java roadmap progress?")) return;

  completed = {};
  saveLocal();
  render();

  if (currentUser) {
    try {
      await saveCloud();
      $("syncStatus").textContent = "☁️ Progress reset and saved";
    } catch (error) {
      console.error(error);
      $("syncStatus").textContent = "⚠️ Reset locally; Firebase save failed";
    }
  }
});

render();
