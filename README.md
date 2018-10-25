# Milestone Project 2

My project is a front-end only data dashboard. This project proved challenging at points but definitely felt very rewarding. Although I would have like to make the website as responsive as possible, it was not my biggest
priority. My main priority was to make sure all charts were informative, working, and most importinaly, interactive. I feel as if I achieved that.

The data dashbaord is one page, as having multiple pages would not have been appropriate.

## UX

For this project, making the data easy to read but also giving a user a great experience was important. 

**User Stories:**

* **_As a sure I can:_** select a different region to display new information.
* **_As a sure I can:_** select an individual country to display new information.
* **_As a sure I can:_** select a certain element of the dataset to be displayed
* **_As a sure I can:_** see where the data came from

I have left a wireframe in the assets folder, in both pdf and xd file formats. As you can see from the wireframe some
aspects were changed. I believe it was for the best.

## Features

**Existing Features**

* **_Landing Graph:_** allows users to select different regions while also comparing regions
* **_Pie Charts_** allows users to compare population and climates of different countries easily. 
* **_Bar Charts_** users can see the top 5 of whatever information they wish to select.
* **_Scatter Plots_** users can compare 2 different pieces of data to see if there is a correlation
* **_How it Works Button_** users can click on this to see how the data dashboard works.

## Technologies Used

[Bootstrap](https://getbootstrap.com/)

[Fontawesome](https://fontawesome.com/)

[jQuery](https://jquery.com/)

[d3.js](https://d3js.org/)

[dc](https://cdnjs.com/libraries/dc)

[crossfilter](https://cdnjs.com/libraries/crossfilter)

[queue-async](https://cdnjs.com/libraries/queue-async)

## Testing

To begin my testing I would check all values on charts. I discovered some values for certain countries would 
be invalid. So I began data cleaning to remove these invalid values. I did this for all values that I used.

Another part of testing was to see if it was responsive. Although this wasn't a main priority because of how the graphs
worked, I wanted to make sure the website worked well on all devices. Making the graphs responsive proved difficult,
however I achieved this by taking the width and height on the users window as a variable, then divided charts to scale.
The result of this left me satisfied, however the charts will not resize when the users window is resized.

## Deployment

I decided to deploy the website on GitHub Pages. In order to deploy it I went intomy repository settings
and set the GitHub Pages source to master branch. You can view the website [here](https://khalem.github.io/Milestone-Project-2/)!

## Credits

##### Data

All the data came from [Fernando Lasso](https://www.kaggle.com/fernandol/countries-of-the-world)

##### Media

The world photo in the background came from [wikimedia](https://commons.wikimedia.org/wiki/File:Continents.svg)
