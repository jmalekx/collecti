//Project styles and utilities
import { colours } from '../styles/commonStyles';

/*
  Statistics Utility Module

  Provides functions for generating chart data, chart configurations, 
  and calculating collection statistics. 
*/

const statUtils = {

  //Generates chart data based on collections and selected time period
  generateChartData: (collections, selectedIndex) => {
    //Default data when no collections exist
    if (!collections || collections.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }]
      };
    }

    //Create new date object to avoid mutating og date
    const currentDate = new Date();
    const startDate = statUtils.getStartDate(collections, selectedIndex, currentDate);
    const dateCountMap = {};
    let labels = [];
    let dataPoints = [];

    //Process data based on selected time frame
    if (selectedIndex === 0 || selectedIndex === 1) {
      labels = statUtils.getDailyLabels(startDate, new Date(), selectedIndex);
      statUtils.countPostsByDate(collections, startDate, dateCountMap, 'daily');
      dataPoints = labels.map(label => dateCountMap[label] || 0);
    }
    else if (selectedIndex === 2) {
      labels = statUtils.getMonthlyLabels(new Date(), 12);
      statUtils.countPostsByDate(collections, startDate, dateCountMap, 'monthly');
      dataPoints = labels.map(label => dateCountMap[label] || 0);
    }
    else {
      const monthsDiff = statUtils.getMonthsDifference(startDate, new Date());
      const months = Math.min(12, Math.max(1, monthsDiff)); //Ensure at least 1 month
      labels = statUtils.getMonthlyLabels(new Date(), months);
      statUtils.countPostsByDate(collections, startDate, dateCountMap, 'monthly');
      dataPoints = labels.map(label => dateCountMap[label] || 0);
    }

    //Ensure we have at least one valid data point
    if (dataPoints.length === 0) {
      dataPoints = [0];
    }

    return {
      labels,
      datasets: [{ data: dataPoints }]
    };
  },

  //Creates chart configuration based on selected time period
  getChartConfig: (selectedIndex) => ({
    backgroundGradientFrom: "#FFD6EC",
    backgroundGradientTo: colours.buttons,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${Math.min(opacity + 0.6, 1)})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${Math.min(opacity + 0.3, 1)})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colours.buttonsTextPink,
      fill: '#FFFFFF',
    },
    strokeWidth: 4,
    yAxisSuffix: '',
    formatXLabel: (value, index) => {
      if (selectedIndex === 1) {
        //For month view only show certain days
        const day = parseInt(value.split('/')[0]);
        return [1, 5, 10, 15, 20, 25, 30].includes(day) ? value : '';
      }
      else if (selectedIndex === 0 && index % 2 !== 0) {
        return '';
      }
      return value;
    },
    formatYLabel: (yValue) => {
      const val = parseInt(yValue);
      return val % 5 === 0 ? val.toString() : '';
    },
  }),

  //Calculates collection statistics and metrics
  calculateTotalStats: (collections) => {
    if (!collections || collections.length === 0) {
      return {
        total: 0,
        most: 0,
        mostDate: 'None',
        mostPopularCollection: { id: '', name: 'None', count: 0 }
      };
    }

    let total = 0;
    let mostActive = { count: 0, date: null };
    const dateCountMap = {};
    let mostPopularCollection = { id: '', name: 'None', count: 0 };

    collections.forEach(collection => {
      if (!collection.items) return;

      const itemCount = collection.items.length;
      if (itemCount > mostPopularCollection.count) {
        mostPopularCollection = {
          id: collection.id,
          name: collection.name,
          count: itemCount
        };
      }

      collection.items.forEach(item => {
        const itemDate = new Date(item.createdAt);
        const dateStr = `${itemDate.getDate()}/${itemDate.getMonth() + 1}/${itemDate.getFullYear()}`;

        dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
        total++;

        if (dateCountMap[dateStr] > mostActive.count) {
          mostActive = { count: dateCountMap[dateStr], date: new Date(itemDate) };
        }
      });
    });

    const mostActiveDate = mostActive.date ?
      `${mostActive.date.getDate()}/${mostActive.date.getMonth() + 1}/${mostActive.date.getFullYear()}` :
      'None';

    return {
      total,
      most: mostActive.count,
      mostDate: mostActiveDate,
      mostPopularCollection
    };
  },

  //Helper: get start date based on selected time period
  getStartDate: (collections, selectedIndex, today) => {
    const newDate = new Date(today);

    switch (selectedIndex) {
      case 0:
        return new Date(newDate.setDate(newDate.getDate() - 7));
      case 1:
        return new Date(newDate.setMonth(newDate.getMonth() - 1));
      case 2:
        return new Date(newDate.setFullYear(newDate.getFullYear() - 1));
      case 3:
      default:
        //Find earliest date in collections or default to 1 month ago
        const earliestDate = collections.reduce((earliest, collection) => {
          if (!collection.items || collection.items.length === 0) return earliest;

          const dates = collection.items
            .map(item => new Date(item.createdAt).getTime())
            .filter(time => !isNaN(time)); //Filter out invalid dates

          if (dates.length === 0) return earliest;

          const collectionEarliest = new Date(Math.min(...dates));
          return !earliest || collectionEarliest < earliest ? collectionEarliest : earliest;
        }, null);

        return earliestDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
    }
  },

  //Helper: generate daily labels
  getDailyLabels: (startDate, endDate, selectedIndex) => {
    const labels = [];
    const keyDays = selectedIndex === 1 ? [1, 5, 10, 15, 20, 25, 30] : null;

    //Calculate days between dates (adding 1 to include the current day)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const day = date.getDate();

      //Add day to labels if key day (for month view) or all days (for week view)
      if (!keyDays || keyDays.includes(day)) {
        labels.push(`${day}/${date.getMonth() + 1}`);
      }
    }
    return labels;
  },

  //Helper: generate monthly labels
  getMonthlyLabels: (endDate, monthsToShow) => {
    const labels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    //Ensure at least 1 month shwon
    const months = Math.max(1, monthsToShow);

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(endDate);
      monthDate.setMonth(endDate.getMonth() - i);
      labels.push(monthNames[monthDate.getMonth()]);
    }

    return labels;
  },

  //Helper: count posts by date
  countPostsByDate: (collections, startDate, dateCountMap, mode) => {
    collections.forEach(collection => {
      if (!collection.items) return;

      collection.items.forEach(item => {
        if (!item.createdAt) return;

        const itemDate = new Date(item.createdAt);
        //Skip invalid dates and before stat
        if (isNaN(itemDate) || itemDate < startDate) return;

        let key;
        if (mode === 'daily') {
          key = `${itemDate.getDate()}/${itemDate.getMonth() + 1}`;
        } 
        else {
          //For monthly mode (Year and All tabs), use just the month name
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          key = monthNames[itemDate.getMonth()];
        }
        dateCountMap[key] = (dateCountMap[key] || 0) + 1;
      });
    });
  },

  //Helper: get months difference between two dates
  getMonthsDifference: (startDate, endDate) => {
    if (!startDate || !endDate) return 1;

    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    //Ensure at least 1 month difference
    return Math.max(1, monthsDiff);
  }
};

export default statUtils;