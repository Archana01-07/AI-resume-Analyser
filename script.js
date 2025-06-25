const form = document.getElementById('uploadForm');
const skillsList = document.getElementById('skillsList');
const graphBars = document.getElementById('graphBars');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('resume');
  const formData = new FormData();
  formData.append('resume', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:5000/upload-resume', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      alert("❌ Error: " + result.message);
      return;
    }

    const skills = result.analysis.foundSkills;
    skillsList.innerHTML = '';
    graphBars.innerHTML = '';

    skills.forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      skillsList.appendChild(li);
    });

    skills.forEach((skill, index) => {
      const bar = document.createElement('div');
      bar.className = `graph-bar ${['blue', 'purple', 'green'][index % 3]}`;
      bar.textContent = skill;
      graphBars.appendChild(bar);
    });
  } catch (err) {
    alert("❌ Failed to connect to backend.");
    console.error(err);
  }
});
