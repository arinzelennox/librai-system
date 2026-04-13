const Book = require("../models/Book");
const User = require("../models/User");

// ─── GET ALL BOOKS (with search + filters + pagination) ───────────────────────
exports.getBooks = async (req, res) => {
  try {
    const { search, subject, lc, ddc, available, sort, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    // Full text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (lc) query.lc = lc.toUpperCase();
    if (ddc) query.ddc = ddc;
    if (available === "true") query.available = true;

    // Sort options
    let sortObj = { views: -1 }; // default: most viewed
    if (sort === "year") sortObj = { year: -1 };
    if (sort === "title") sortObj = { title: 1 };
    if (sort === "author") sortObj = { author: 1 };
    if (search) sortObj = { score: { $meta: "textScore" }, ...sortObj };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(
      query,
      search ? { score: { $meta: "textScore" } } : {}
    ).sort(sortObj).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch books." });
  }
};

// ─── GET SINGLE BOOK ──────────────────────────────────────────────────────────
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("addedBy", "name");
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    // Increment views
    await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch book." });
  }
};

// ─── CREATE BOOK (admin/librarian only) ───────────────────────────────────────
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, message: "Book added successfully.", book });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "A book with this ISBN already exists." });
    }
    res.status(500).json({ success: false, message: "Failed to create book." });
  }
};

// ─── UPDATE BOOK ──────────────────────────────────────────────────────────────
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: "Book not found." });
    res.json({ success: true, message: "Book updated.", book });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update book." });
  }
};

// ─── DELETE BOOK (soft delete) ────────────────────────────────────────────────
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Book removed from catalog." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete book." });
  }
};

// ─── SAVE / UNSAVE BOOK ───────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.id;
    const isSaved = user.savedBooks.includes(bookId);

    if (isSaved) {
      user.savedBooks = user.savedBooks.filter(id => id.toString() !== bookId);
    } else {
      user.savedBooks.push(bookId);
    }
    await user.save();
    res.json({ success: true, saved: !isSaved, message: isSaved ? "Removed from saved." : "Book saved." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update saved books." });
  }
};

// ─── GET RECOMMENDATIONS ──────────────────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedBooks");
    const savedIds = user.savedBooks.map(b => b._id);

    // Get LC classes from saved books for recommendations
    const savedLCClasses = [...new Set(user.savedBooks.map(b => b.lc).filter(Boolean))];

    let recommendations;
    if (savedLCClasses.length > 0) {
      recommendations = await Book.find({
        _id: { $nin: savedIds },
        lc: { $in: savedLCClasses },
        isActive: true,
      }).sort({ views: -1 }).limit(6);
    } else {
      recommendations = await Book.find({ isActive: true }).sort({ views: -1 }).limit(6);
    }

    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to get recommendations." });
  }
};

// ─── SEED BOOKS (admin only — run once) ──────────────────────────────────────
exports.seedBooks = async (req, res) => {
  try {
    const seedData = [
      { title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, subject: "African Literature", ddc: "800", ddc_full: "823.914", lc: "P", lc_full: "PR9387.9.A3", cover: "📗", tags: ["Nigeria","colonialism","culture"], views: 842, available: true, description: "A novel about the Igbo community in pre-colonial Nigeria." },
      { title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", year: 2006, subject: "Historical Fiction", ddc: "800", ddc_full: "823.92", lc: "P", lc_full: "PR9387.9.A3234", cover: "📘", tags: ["Nigeria","Biafra","war"], views: 634, available: true, description: "Set before and during the Nigerian Civil War." },
      { title: "Digital Archives: Theory and Practice", author: "Margaret Hedstrom", year: 2019, subject: "Library Science", ddc: "000", ddc_full: "025.04", lc: "Z", lc_full: "Z678.93", cover: "📙", tags: ["archives","digital","preservation"], views: 412, available: false, description: "A guide to building and managing digital archives." },
      { title: "Artificial Intelligence in Libraries", author: "Stuart Weibel", year: 2022, subject: "Information Science", ddc: "000", ddc_full: "025.0028", lc: "Z", lc_full: "Z678.9", cover: "📕", tags: ["AI","libraries","cataloguing"], views: 567, available: true, description: "The transformative impact of AI on library management." },
      { title: "The Famished Road", author: "Ben Okri", year: 1991, subject: "Nigerian Literature", ddc: "800", ddc_full: "823.914", lc: "P", lc_full: "PR9387.9.O37", cover: "📗", tags: ["Nigeria","mythology","spirit"], views: 389, available: true, description: "A magical realist novel following Azaro in post-independence Nigeria." },
      { title: "Introduction to Information Retrieval", author: "Manning, Raghavan, Schütze", year: 2008, subject: "Computer Science", ddc: "000", ddc_full: "025.524", lc: "Z", lc_full: "Z667", cover: "📘", tags: ["IR","NLP","search"], views: 721, available: true, description: "Foundational textbook on information retrieval." },
      { title: "Records Management in Africa", author: "Shadrack Katuu", year: 2020, subject: "Archives", ddc: "000", ddc_full: "651.5096", lc: "Z", lc_full: "CD1003", cover: "📙", tags: ["Africa","records","archives"], views: 298, available: true, description: "Records management across African institutions." },
      { title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", year: 2003, subject: "Nigerian Literature", ddc: "800", ddc_full: "823.92", lc: "P", lc_full: "PR9387.9.A3234", cover: "📕", tags: ["Nigeria","family","religion"], views: 503, available: false, description: "A coming-of-age story set in post-colonial Nigeria." },
    ];

    await Book.deleteMany({});
    const books = await Book.insertMany(seedData);
    res.json({ success: true, message: `${books.length} books seeded successfully.`, count: books.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Seeding failed: " + err.message });
  }
};
