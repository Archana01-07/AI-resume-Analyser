const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function analyzeResume(text) {
  const skills = ['Python', 'Java', 'React', 'AI', 'Machine Learning', 'Node.js', 'C++'];
  const lower = text.toLowerCase();
  const foundSkills = skills.filter(skill => lower.includes(skill.toLowerCase()));
  const missingSkills = skills.filter(skill => !foundSkills.includes(skill));
  return { foundSkills, missingSkills, score: foundSkills.length };
}

app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded.' });

  let extractedText = '';
  try {
    if (file.mimetype === 'application/pdf') {
      const data = fs.readFileSync(file.path);
      const parsed = await pdfParse(data);
      extractedText = parsed.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: file.path });
      extractedText = result.value;
    } else if (file.mimetype.startsWith('image/')) {
      const { data: { text } } = await tesseract.recognize(file.path, 'eng');
      extractedText = text;
    } else {
      return res.status(400).json({ message: 'Unsupported file type.' });
    }

    fs.unlinkSync(file.path);
  } catch (err) {
    console.error("❌ Text extraction failed:", err.message);
    return res.status(500).json({ message: 'Failed to extract text: ' + err.message });
  }

  if (!extractedText.trim()) {
    return res.status(400).json({ message: 'No readable text in resume.' });
  }

  const analysis = analyzeResume(extractedText);
  return res.json({ analysis });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
