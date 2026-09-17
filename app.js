import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/*
  1. Create a Firebase project.
  2. Enable Anonymous Authentication.
  3. Create Firestore Database.
  4. Replace the values below with your Firebase Web App config.
*/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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

let completed = JSON.parse(localStorage.getItem("javaTracker") || "{}");
let firestoreReady = false;
let db, userId;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
db = getFirestore(app);

const validConfig = !Object.values(firebaseConfig).some(v => String(v).startsWith("YOUR_"));

if (validConfig) {
  onAuthStateChanged(auth, async user => {
    if (!user) return;
    userId = user.uid;
    firestoreReady = true;
    document.getElementById("syncStatus").textContent = "☁️ Sync enabled";
    const snap = await getDoc(doc(db, "progress", userId));
    if (snap.exists()) {
      completed = snap.data().completed || {};
      localStorage.setItem("javaTracker", JSON.stringify(completed));
      render();
    }
  });
  signInAnonymously(auth).catch(() => {
    document.getElementById("syncStatus").textContent = "Local progress";
  });
}

function save() {
  localStorage.setItem("javaTracker", JSON.stringify(completed));
  if (firestoreReady) {
    setDoc(doc(db, "progress", userId), { completed }).catch(() => {});
  }
}

function allTopics() {
  return Object.entries(roadmap).flatMap(([section, topics]) =>
    topics.map(topic => ({section, topic}))
  );
}

function render() {
  const search = document.getElementById("search").value.toLowerCase().trim();
  const filter = document.getElementById("filter").value;
  const container = document.getElementById("roadmap");
  container.innerHTML = "";

  let visible = 0;
  Object.entries(roadmap).forEach(([section, topics]) => {
    const filtered = topics.filter(topic => {
      const done = !!completed[`${section}::${topic}`];
      return (!search || `${section} ${topic}`.toLowerCase().includes(search))
        && (filter === "all" || (filter === "done" ? done : !done));
    });
    if (!filtered.length) return;

    const card = document.createElement("section");
    card.className = "section";
    card.innerHTML = `<h2>${section}</h2><div class="meta">${topics.filter(t => completed[`${section}::${t}`]).length} / ${topics.length} completed</div>`;

    filtered.forEach(topic => {
      visible++;
      const key = `${section}::${topic}`;
      const row = document.createElement("div");
      row.className = `topic ${completed[key] ? "done" : ""}`;
      row.innerHTML = `<input type="checkbox" ${completed[key] ? "checked" : ""} aria-label="${topic}">
                       <label>${topic}</label>`;
      row.querySelector("input").addEventListener("change", e => {
        completed[key] = e.target.checked;
        if (!e.target.checked) delete completed[key];
        save();
        render();
      });
      card.appendChild(row);
    });
    container.appendChild(card);
  });

  if (!visible) container.innerHTML = `<div class="empty">No matching topics.</div>`;

  const total = allTopics().length;
  const done = allTopics().filter(x => completed[`${x.section}::${x.topic}`]).length;
  const pct = total ? Math.round(done * 100 / total) : 0;
  document.getElementById("percent").textContent = `${pct}%`;
  document.getElementById("count").textContent = `${done} / ${total} completed`;
  document.getElementById("bar").style.width = `${pct}%`;
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("filter").addEventListener("change", render);
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset all Java roadmap progress?")) {
    completed = {};
    save();
    render();
  }
});
render();
