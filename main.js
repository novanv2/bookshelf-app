const books = [];
const RENDER_EVENT = "render-buku";

//Mengambil element HTML yang diperlukan
document.addEventListener('DOMContentLoaded', function () {
    bookListener();
    
    // Event listener untuk input pencarian
    const searchButton = document.getElementById("searchSubmit");
    searchButton.addEventListener("click", function (event) {
        event.preventDefault();
        const query = document.getElementById("searchBookTitle").value;
        searchBuku(query);
    });
    document.getElementById("searchBookTitle").addEventListener("input", function(event) {
        const query = event.target.value;
        searchBuku(query);
    })

    //Eksekusi fungsi loadDataStorage
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

//Fungsi listener dan reset form untuk penambahan buku
function bookListener() {
    const book_form = document.getElementById('bookForm');

    book_form.addEventListener('submit', function (event) {
      event.preventDefault();

      const bookId = document.getElementById('bookId').value;
      if (bookId) {
        saveEditedBooks(parseInt(bookId));
      } else {
        addBook();
      }

      document.getElementById('bookForm').reset();
      document.getElementById('bookId').value = '';
    });
}

//Fungsi penambahan buku
function addBook() {
    const judulBuku = document.getElementById("bookFormTitle").value;
    const penulisBuku = document.getElementById("bookFormAuthor").value;
    const tahunBuku = Number(document.getElementById("bookFormYear").value);
    const isCompleted = document.getElementById("bookFormIsComplete").checked;

    const generatedID = generateId();
    const bookObject = generateBooksObject(
       generatedID,
       judulBuku,
       penulisBuku,
       tahunBuku,
       isCompleted
    );
    books.push(bookObject);

    document.dispatchEvent(new Event (RENDER_EVENT));
    saveData();
}

//Fungsi untuk generate ID
function generateId() {
    return new Date().getTime();
}

//Fungsi untuk mendapatkan array buku
function generateBooksObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

//Membuat fungsi untuk element buku di DOM
function bookElement(bookObject) {
    //Judul Buku
    const titleBook = document.createElement("h3");
    //titleBook.setAttribute("data-testid", "bookItemTitle");
    titleBook.innerText = bookObject.title;

    //Author buku
    const authorBook = document.createElement("p");
    //authorBook.setAttribute("data-testid", "bookItemAuthor");
    authorBook.innerText = "Penulis : " + bookObject.author;

    //Tahun buku
    const yearBook = document.createElement("p");
    //yearBook.setAttribute("data-testid", "bookItemYear");
    yearBook.innerText = "Tahun : " + bookObject.year;

    //div Container
    const container = document.createElement("div");
    //container.setAttribute("data-bookid", bookObject.id);
    //container.setAttribute("data-testid", "bookItem");
    container.classList.add("itemBook");
    container.append(titleBook, authorBook, yearBook);

    //div Container Buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("item", "shadow");
    buttonContainer.append(container);
    buttonContainer.setAttribute("id", `book-${bookObject.id}`);

    //buttons
    const buttonEdit = document.createElement("button");
    //buttonEdit.setAttribute("data-testid", "bookItemEditButton");
    buttonEdit.classList.add("edit-Button");
    buttonEdit.innerText = "Edit Buku"
    buttonEdit.addEventListener("click", function() {
        editBooks(bookObject.id);
    });

    const buttonDelete = document.createElement("button");
    //buttonDelete.setAttribute("data-testid", "bookItemDeleteButton");
    buttonDelete.classList.add("delete-Button");
    buttonDelete.innerText = "Hapus Buku";
    buttonDelete.addEventListener("click", function() {
        removeBooksFromCompleted(bookObject.id);
    });


    if (bookObject.isComplete) {
        const buttonUndo = document.createElement("button");
        //buttonUndo.setAttribute("data-testid", "bookItemIsCompleteButton");
        buttonUndo.classList.add("undo-button");
        buttonUndo.innerText = "Belum Dibaca";
        buttonUndo.addEventListener("click", function() {
            undoBooksFromCompleted(bookObject.id);
        });

        buttonContainer.append(buttonUndo, buttonDelete, buttonEdit);
    } else {
        const buttonComplete = document.createElement("button");
        //buttonComplete.setAttribute("data-testid", "bookItemIsCompleteButton");
        buttonComplete.classList.add("complete-Button");
        buttonComplete.innerText = "Sudah Dibaca";
        buttonComplete.addEventListener("click", function() {
            addBooksToCompleted(bookObject.id);
        });

        buttonContainer.append(buttonComplete, buttonDelete, buttonEdit);
    }
    return buttonContainer;
}

//Beberapa function untuk status buku
//Function untuk mecari id buku
function findBook(idBook) {
    for (const bookItemCari of books) {
        if (bookItemCari.id === idBook) {
            return bookItemCari;
        }
    }
    return null;
}

//Memindahkan buku sudah dibaca
function addBooksToCompleted(idBook) {
    const bookTarget = findBook(idBook);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Menghapus buku
function removeBooksFromCompleted(idBook) {
    const bookTargetIndex = findBookIndex(idBook);

    if (bookTargetIndex === -1) return;

    books.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Mencari buku di Array untuk dihapus
function findBookIndex(idBook) {
    for (const index in books) {
      if (books[index].id === idBook) {
        return index;
      }
    }
    return -1;
}

//Mengembalikan buku ke belum dibaca
function undoBooksFromCompleted(idBook) {
    const bookTarget = findBook(idBook);

    if (bookTarget === null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Edit buku
function editBooks(idBook) {
    const book = books.find(book => book.id === idBook);

    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;

    document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });

    document.getElementById('bookId').value = idBook;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function saveEditedBooks(idBook) {
    const bookIndex = books.findIndex(book => book.id === idBook);

    books[bookIndex].title = document.getElementById('bookFormTitle').value;
    books[bookIndex].author = document.getElementById('bookFormAuthor').value;
    books[bookIndex].year = Number(document.getElementById('bookFormYear').value);
    books[bookIndex].isComplete = document.getElementById('bookFormIsComplete').checked;

    alert("Buku berhasil di edit");
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//Memfilter isi searchbox
let searchQuery = "";  

function searchBuku(query) {
  searchQuery = query.toLowerCase();  
  document.dispatchEvent(new Event(RENDER_EVENT)); 
}

function getFilteredBooks() {
  if (searchQuery === "") {
    return books;
  }
  return books.filter(book =>
    book.title.toLowerCase().includes(searchQuery)
  );
}

//--------MERENDER KE HTML--------
document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById("incompleteBookList");
    uncompletedBookList.innerHTML = "";

    const completedBookListHTML = document.getElementById("completeBookList");
    completedBookListHTML.innerHTML = "";

    const filteredBook = getFilteredBooks();

    for (const bookItemCari of filteredBook) {
        const bookElementInside = bookElement(bookItemCari);

        if (!bookItemCari.isComplete) {
            uncompletedBookList.append(bookElementInside);
        } else {
            completedBookListHTML.append(bookElementInside);
        }
    }
});

//Storage Local
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
  return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}
  
function loadDataFromStorage() {
    const serialData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serialData);
  
    if (data !== null) {
      for (const bukuData of data) {
        books.push(bukuData);
      }
    }
  document.dispatchEvent(new Event(RENDER_EVENT));
}