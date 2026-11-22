const timelineRoot = document.querySelector('#learning-timeline');
const svgNamespace = 'http://www.w3.org/2000/svg';

const makeSvgElement = (name, attributes = {}) => {
  const element = document.createElementNS(svgNamespace, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

const appendCurve = (svg, stages) => {
  svg.replaceChildren();

  const defs = makeSvgElement('defs');
  const gradient = makeSvgElement('linearGradient', { id: 'curve-stroke', x1: '0', y1: '1', x2: '1', y2: '0' });
  gradient.append(
    makeSvgElement('stop', { offset: '0%', 'stop-color': '#b84925' }),
    makeSvgElement('stop', { offset: '100%', 'stop-color': '#ffb778' })
  );
  defs.append(gradient);
  svg.append(defs);

  [48, 98, 148, 198, 238].forEach((y) => {
    svg.append(makeSvgElement('line', { x1: '24', y1: String(y), x2: '696', y2: String(y), class: 'curve-gridline' }));
  });

  const left = 34;
  const right = 686;
  const bottom = 232;
  const rise = 176;
  const intervals = Math.max(stages.length - 1, 1);
  const points = stages.map((stage, index) => {
    const progress = index / intervals;
    return { x: left + (right - left) * progress, y: bottom - rise * Math.pow(progress, 1.32) };
  });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const distance = end.x - start.x;
    path += ` C ${start.x + distance * 0.42} ${start.y}, ${end.x - distance * 0.42} ${end.y}, ${end.x} ${end.y}`;
  }

  svg.append(makeSvgElement('path', { d: `${path} L ${right} 248 L ${left} 248 Z`, class: 'curve-fill' }));
  svg.append(makeSvgElement('path', { d: path, class: 'curve-glow' }));
  svg.append(makeSvgElement('path', { d: path, class: 'curve-line' }));

  points.forEach((point, index) => {
    const group = makeSvgElement('g', { class: 'curve-node' });
    group.append(
      makeSvgElement('circle', { cx: String(point.x), cy: String(point.y), r: '9', class: 'curve-node-ring' }),
      makeSvgElement('circle', { cx: String(point.x), cy: String(point.y), r: '3.5', class: 'curve-node-core' })
    );
    const number = makeSvgElement('text', { x: String(point.x), y: '272', class: 'curve-node-number', 'text-anchor': 'middle' });
    number.textContent = String(index + 1).padStart(2, '0');
    group.append(number);
    svg.append(group);
  });
};

const createStage = (stage, index) => {
  const item = document.createElement('li');
  item.className = 'learning-timeline-item';
  item.style.setProperty('--stage-order', index);

  const dateColumn = document.createElement('div');
  dateColumn.className = 'learning-date-column';
  const date = document.createElement('time');
  date.className = 'learning-date';
  date.dateTime = stage.date;
  const parsedDate = new Date(`${stage.date}T00:00:00Z`);
  date.textContent = Number.isNaN(parsedDate.getTime())
    ? 'Date to set'
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsedDate);
  const phaseLabel = document.createElement('span');
  phaseLabel.className = 'learning-phase-label';
  phaseLabel.textContent = `STAGE ${String(index + 1).padStart(2, '0')}`;
  dateColumn.append(date, phaseLabel);

  const node = document.createElement('span');
  node.className = 'learning-timeline-node';
  node.setAttribute('aria-hidden', 'true');

  const card = document.createElement('article');
  card.className = 'learning-stage-card glass-card';
  const top = document.createElement('div');
  top.className = 'learning-stage-top';
  const status = document.createElement('span');
  status.className = 'learning-stage-status';
  status.textContent = stage.status;
  const serial = document.createElement('span');
  serial.className = 'learning-stage-serial';
  serial.textContent = `LC / ${String(index + 1).padStart(2, '0')}`;
  top.append(status, serial);

  const title = document.createElement('h3');
  title.textContent = stage.title;
  const summary = document.createElement('p');
  summary.className = 'learning-stage-summary';
  summary.textContent = stage.summary;

  const details = document.createElement('div');
  details.className = 'learning-stage-details';
  const focusSection = document.createElement('div');
  focusSection.className = 'learning-focus';
  const focusLabel = document.createElement('span');
  focusLabel.className = 'learning-detail-label';
  focusLabel.textContent = 'FOCUS';
  const focusList = document.createElement('ul');
  (Array.isArray(stage.focus) ? stage.focus : []).forEach((topic) => {
    const focusItem = document.createElement('li');
    focusItem.textContent = topic;
    focusList.append(focusItem);
  });
  focusSection.append(focusLabel, focusList);

  const checkpoint = document.createElement('div');
  checkpoint.className = 'learning-checkpoint';
  const checkpointLabel = document.createElement('span');
  checkpointLabel.className = 'learning-detail-label';
  checkpointLabel.textContent = 'CHECKPOINT';
  const checkpointText = document.createElement('p');
  checkpointText.textContent = stage.checkpoint;
  checkpoint.append(checkpointLabel, checkpointText);
  details.append(focusSection, checkpoint);
  card.append(top, title, summary, details);
  item.append(dateColumn, node, card);
  return item;
};

const showLoadError = () => {
  const message = document.createElement('li');
  message.className = 'timeline-loading timeline-error';
  message.textContent = 'The timeline could not load. Check that learning.json is next to learning.html.';
  timelineRoot.replaceChildren(message);
};

fetch('./learning.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error('Could not load learning.json');
    return response.json();
  })
  .then((data) => {
    if (!timelineRoot || !Array.isArray(data.stages) || data.stages.length === 0) throw new Error('The learning timeline is empty');

    document.title = `${data.pageTitle || 'Learning Path'} — Siddharth`;
    document.querySelector('#learning-intro').textContent = data.pageIntro || '';
    document.querySelector('#learning-start').textContent = data.startingPoint || '';
    document.querySelector('#schedule-note').textContent = data.scheduleNote || '';
    document.querySelector('#stage-count').textContent = `${String(data.stages.length).padStart(2, '0')} STAGES`;
    timelineRoot.replaceChildren(...data.stages.map(createStage));
    appendCurve(document.querySelector('#learning-curve'), data.stages);
  })
  .catch((error) => {
    console.error(error);
    if (timelineRoot) showLoadError();
  });
