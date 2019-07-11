import React, { Component } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';

// Header Menu
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ExitIcon from '@material-ui/icons/ExitToApp';
import MenuIcon from '@material-ui/icons/Menu';

// SearchBar Component
import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/ToolBar';
import InputBase from '@material-ui/core/InputBase';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';

// Table Component
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// Form Component
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
// import MenuItem from '@material-ui/core/MenuItem';

// import SearchBar from '../../components/SearchBar';
// import DataTable from '../../components/DataTable';
// import Form from '../../components/Form';
import { AuthService, QuestionService } from '../../services';
import {
  bufferStringDecoder,
  handleError,
  handleSuccess,
} from '../../tools/Network';
import { connect } from 'react-redux';
import './styles.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      success: null,
      headerMenu: {
        right: false,
      },
      primaryMenuList: [
        {
          label: 'Home',
          icon: <HomeIcon />,
        },
        {
          label: 'Create',
          icon: <AddIcon />,
        },
        {
          label: 'Search',
          icon: <SearchIcon />,
        },
      ],
      secondaryMenuList: [
        {
          label: 'Log Out',
          icon: <ExitIcon />,
        },
      ],
      searchBarClasses: makeStyles(theme => ({
        searchIcon: {
          gridColumn: 1 / 2 / 1,
          width: theme.spacing(7),
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        inputRoot: {
          color: 'inherit',
        },
        inputInput: {
          gridColumn: 2 / 2 / 1,
          padding: theme.spacing(1, 1, 1, 7),
          transition: theme.transitions.create('width'),
          width: '100%',
          [theme.breakpoints.up('md')]: {
            width: 200,
          },
        },
      })),
      searchOptions: [
        { label: 'Subject', isActive: true },
        { label: 'Topic', isActive: false },
        { label: 'Question', isActive: false },
      ],
      searchOptionsMenuIsOpen: false,
      searchQueryContent: {
        Subject: '',
        Topic: '',
        Question: '',
      },
      networkQueryResults: [
        // { type: 'Subject', id: 0, label: 'Math' },
        // { type: 'Subject', id: 1, label: 'History' },
        // { type: 'Topic', subject_id: 0, id: 0, label: 'Algebra' },
        // { type: 'Topic', subject_id: 1, id: 1, label: 'Roman Empire' },
        // { id: 0, title: 'test0', author: 'Tit', editor: 'matt' },
        // { id: 1, title: 'test1', author: 'Tit', editor: 'matt' },
        // { id: 2, title: 'test2', author: 'Tit', editor: 'matt' },
        // { id: 3, title: 'test3', author: 'Tit', editor: 'matt' },
        // { id: 0, title: 'test0', author: 'Tit', editor: 'matt' },
        // { id: 1, title: 'test1', author: 'Tit', editor: 'matt' },
        // { id: 2, title: 'test2', author: 'Tit', editor: 'matt' },
        // { id: 3, title: 'test3', author: 'Tit', editor: 'matt' },
        // { id: 0, title: 'test0', author: 'Tit', editor: 'matt' },
        // { id: 1, title: 'test1', author: 'Tit', editor: 'matt' },
        // { id: 2, title: 'test2', author: 'Tit', editor: 'matt' },
        // { id: 3, title: 'test3', author: 'Tit', editor: 'matt' },
        // { id: 1, title: 'test1', author: 'Tit', editor: 'matt' },
        // { id: 2, title: 'test2', author: 'Tit', editor: 'matt' },
        // { id: 3, title: 'test3', author: 'Tit', editor: 'matt' },
      ],
      bodyViewState: {
        active: 'Search',
      },
      createForm: {
        domain: 'Subject',
        formResourceValues: {
          Subject: {
            label: '',
          },
          Topic: {
            subject: 'Math',
            label: '',
          },
          Question: {
            subject: 'Math',
            topic: 'Algebra',
            content: '',
            firstAnswer: '',
            secondAnswer: '',
            thirdAnswer: '',
            fourthAnswer: '',
          },
        },
      },
    };

    this.AuthService = new AuthService();
    this.QuestionService = new QuestionService();
    this.searchBarRef = React.createRef();
    this.createFormChooseInputRef = React.createRef();
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleOpenSearchOptions = this.handleOpenSearchOptions.bind(this);
    this.handleCloseSearchOptions = this.handleCloseSearchOptions.bind(this);
    this.setSearchQuery = this.setSearchQuery.bind(this);
    this.fetchAllResources = this.fetchAllResources.bind(this);
    this.searchDatabase = this.searchDatabase.bind(this);
    this.handleCreateFormUpdate = this.handleCreateFormUpdate.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidMount() {
    this.fetchAllResources(console.log);
  }

  fetchAllResources(cb) {
    this.QuestionService.list().then(response => {
      console.log('response:::', response);
      if (response.error || !response.resources) {
        cb('error', response.error);
        return handleError(this, response.error);
      }
      cb('fetchAllResources() success');
      this.setState({
        networkQueryResults: response.resources,
      });
    });
  }

  searchDatabase(event, { listOptions, resourceType, structureType }) {
    console.log(
      'searchDatabase()',
      event,
      listOptions,
      resourceType,
      structureType,
    );
    if (!event || event.key !== 'Enter') return;
    this.QuestionService.query({
      listOptions,
      resourceType,
      structureType,
    }).then(response => {
      console.log('response:::', response);
      this.setState({
        networkQueryResults: response.resources,
      });
    });
  }

  isValidSetOfResourceValues(type, formResourceValues) {
    const currentValues = formResourceValues[type];
    let currentValuesKeys = Object.keys(currentValues);
    let isValid = true;
    for (let i = 0; i < currentValuesKeys.length; i++) {
      if (currentValues[currentValuesKeys[i]] === '') {
        isValid = false;
        break;
      }
    }
    return isValid;
  }

  createNewResource(type, state) {
    console.log('createNewResource()', type);
    if (
      !this.isValidSetOfResourceValues(
        type,
        state.createForm.formResourceValues,
      )
    ) {
      handleError(this, 'Values can not be empty!');
      return this.handleCreateFormUpdate({
        reset: true,
        domain: type,
      });
    }
    this.QuestionService.create({
      type,
      listOfResources: state.networkQueryResults,
      formResourceValues: state.createForm.formResourceValues[type],
    })
      .then(response => {
        if (!response.success) throw response.error;
        console.log('Success::', response);
        this.handleCreateFormUpdate({
          reset: true,
          domain: type,
        });
        handleSuccess(this, `Your ${type} has been submitted!`);
      })
      .catch(error => {
        console.log('this.QuestionService.create error:', error);
        this.handleCreateFormUpdate({
          reset: true,
          domain: type,
        });
        handleError(this, error);
      });
  }

  editStoredResource() {
    console.log('editStoredResource()');
    this.QuestionService.update({})
      .then(response => {
        if (!response.success) throw response.error;
      })
      .catch(error => {
        console.log('this.QuestionService.update error:', error);
      });
  }

  deleteStoredResource() {
    console.log('deleteStoredResource()');
    this.QuestionService.delete({})
      .then(response => {
        if (!response.success) throw response.error;
      })
      .catch(error => {
        console.log('this.QuestionService.delete error:', error);
      });
  }

  setSearchQuery(evt, option) {
    this.setState(
      {
        searchQueryContent: {
          ...this.state.searchQueryContent,
          [option.label]: evt.target.value,
        },
      },
      () => {
        console.log(
          'this.state.searchQueryContent',
          this.state.searchQueryContent,
        );
      },
    );
  }

  handleLogOut(evt) {
    this.toggleDrawer(evt, 'right', false);
    console.log('handleLogOut()', evt);
    this.AuthService.logout()
      .then(res => {
        if (res.error) {
          throw new Error('Error logging out!');
        }
        this.props.history.push('/login');
        this.props.clearUser();
      })
      .catch(error => {
        console.log(`handleLogOut() error`, error);
        return handleError(this, error);
      });
  }

  toggleBodyView(evt, active) {
    console.log('toggleBodyView', evt);
    this.toggleDrawer(evt, 'right', false);
    this.setState({
      bodyViewState: {
        active,
      },
    });
  }

  toggleDrawer(event, side, open) {
    console.log('toggleDrawer', event, side, open);
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    console.log('here..', open);

    this.setState({
      headerMenu: {
        right: open,
      },
    });
  }

  renderHeader() {
    return (
      <div className='dashboardHeader'>
        <div className='dashboardHeaderLabel'>
          <a href='/dashboard'>TQDB</a>
        </div>
        <div className='dashboardHeaderOptions'>
          <Button
            className='dashboardHeaderOptionsButton'
            onClick={evt => this.toggleDrawer(evt, 'right', true)}
          >
            Menu
          </Button>
        </div>
      </div>
    );
  }

  handleIconOnClick(label) {
    switch (label) {
      case 'Home':
        return evt => {
          this.fetchAllResources(msg => this.toggleBodyView(evt, 'Home'));
        };
      case 'Create':
        return evt => this.toggleBodyView(evt, 'CreateForm');
      case 'Search':
        return evt => this.toggleBodyView(evt, 'Search');
      case 'Log Out':
        return this.handleLogOut;
    }
  }

  sideList(side, state) {
    return (
      <div className='dashboardHeaderMenuList' role='presentation'>
        <List>
          {state.primaryMenuList.map((primary, index) => (
            <ListItem
              button
              key={index}
              onClick={this.handleIconOnClick(primary.label)}
            >
              <ListItemIcon>{primary.icon}</ListItemIcon>
              <ListItemText primary={primary.label} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {state.secondaryMenuList.map((secondary, index) => (
            <ListItem
              button
              key={index}
              onClick={this.handleIconOnClick(secondary.label)}
            >
              <ListItemIcon>{secondary.icon}</ListItemIcon>
              <ListItemText primary={secondary.label} />
            </ListItem>
          ))}
        </List>
      </div>
    );
  }

  renderRightMenu(state) {
    return (
      <SwipeableDrawer
        anchor='right'
        open={state.headerMenu.right}
        onClose={evt => this.toggleDrawer(evt, 'right', false)}
        onOpen={evt => this.toggleDrawer(evt, 'right', true)}
      >
        {this.sideList('right', state)}
      </SwipeableDrawer>
    );
  }

  handleOpenSearchOptions(evt) {
    console.log('handleOpenSearchOptions');
    this.setState({
      searchOptionsMenuIsOpen: true,
    });
  }

  handleCloseSearchOptions(evt, selectedOption) {
    console.log('handleCloseSearchOptions', evt, this.searchBarRef);
    if (
      this.searchBarRef.current &&
      this.searchBarRef.current.contains(evt.target)
    ) {
      console.log('handleCloseSearchOptions not set');
      return;
    }
    const newSearchOptions = selectedOption
      ? this.state.searchOptions.map(option => {
          return option.label === selectedOption.label
            ? (option.isActive = true)
            : (option.isActive = false);
        })
      : this.state.searchOptions;
    this.setState({
      searchOptionsMenuIsOpen: false,
    });
  }

  renderSearchBarMenuItem(searchOptions) {
    return searchOptions.map((option, index) => {
      if (!option.isActive) {
        return (
          <MenuItem
            key={index}
            onClick={evt => this.handleCloseSearchOptions(evt, option)}
          >
            {option.label}
          </MenuItem>
        );
      }
    });
  }

  generateListOptions(type, query) {
    console.log('generateListOptions() type:::', type);
    let listOptions = 'limit:5';
    // switch (type) {
    //   case 'Subject':
    //     listOptions +=
    //     break;
    //   case 'Topic':
    //     break;
    //   case 'Question':
    //     break;
    // }
    listOptions += `,label:${query}`;
    return listOptions;
  }

  renderSearchBar(state, option) {
    return (
      <div className='searchBar'>
        <div className='searchBarMenu'>
          <Button
            ref={this.searchBarRef}
            aria-controls='menu-list-grow'
            aria-haspopup='true'
            onClick={this.handleOpenSearchOptions}
          >
            {option.label}
          </Button>
          <Popper
            open={state.searchOptionsMenuIsOpen}
            anchorEl={this.searchBarRef.current}
            keepMounted
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper id='menu-list-grow'>
                  <ClickAwayListener
                    onClickAway={evt =>
                      this.handleCloseSearchOptions(evt, null)
                    }
                  >
                    <MenuList>
                      {this.renderSearchBarMenuItem(state.searchOptions)}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
        <InputBase
          placeholder='Search…'
          classes={{
            root: state.searchBarClasses.inputRoot,
            input: state.searchBarClasses.inputInput,
          }}
          inputProps={{ 'aria-label': 'Search' }}
          value={state.searchQueryContent[option.label]}
          onChange={evt => this.setSearchQuery(evt, option)}
          onKeyPress={evt => {
            return this.searchDatabase(evt, {
              listOptions: this.generateListOptions(
                option.label,
                state.searchQueryContent[option.label],
              ),
              resourceType: option.label,
              structureType: 'list',
            });
          }}
        />
      </div>
    );
  }

  renderSearchViewHeader(state) {
    return (
      <div className='dashboardBodyHeader'>
        <AppBar
          classes={{ colorDefault: 'blue' }}
          color='default'
          position='relative'
        >
          {state.searchOptions.map((option, index) => {
            if (option.isActive) {
              return (
                <ToolBar key={index} id='toolbarBodyHeader'>
                  {this.renderSearchBar(state, option)}
                </ToolBar>
              );
            }
          })}
        </AppBar>
      </div>
    );
  }

  renderSearchViewResults(state) {
    return state.searchOptions.map(option => {
      if (option.isActive) {
        return (
          <div className='dataTableContainer'>
            <Paper className='dataTablePaper'>
              <Table className='dataTable' size='medium'>
                {this.renderDataTableHeader(state, option)}
                {this.renderDataTableBody(state, option)}
              </Table>
            </Paper>
          </div>
        );
      }
    });
  }

  renderDataTableHeader(state, option) {
    if (state.networkQueryResults.length === 0) {
      return;
    }
    const rows = state.networkQueryResults.filter(r => r.type === option.label);
    console.log('renderDataTableHeader() rows:::', rows);
    if (rows.length > 0) {
      return (
        <TableHead>
          <TableRow>
            {Object.keys(rows[0]).map((label, index) => (
              <TableCell key={index} align={index === 0 ? 'left' : 'center'}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      );
    }
  }

  renderNoResultsView() {
    return (
      <TableBody>
        <TableRow>
          <TableCell>No Results</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  renderDataTableBody(state, option) {
    if (state.networkQueryResults.length === 0) {
      return this.renderNoResultsView();
    }
    const rows = state.networkQueryResults.filter(r => r.type === option.label);
    const preprocess = entry => {
      console.log('preprocess:::', entry);
      if (typeof entry[1] === 'object') {
        return bufferStringDecoder(entry[1]);
      }
      if (entry[0] === 'created_at') {
        return new Date(Number(entry[1])).toString();
      }
      return entry[1];
    };
    return (
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {Object.entries(row).map((entry, eIndex) => (
              <TableCell key={eIndex} align={eIndex === 0 ? 'left' : 'center'}>
                {preprocess(entry)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  renderBodyDataTable(state) {
    return state.searchOptions.map((option, index) => {
      console.log('renderBodyDataTable() option:::', option);
      return (
        <div key={index} className='dataTableContainer'>
          <h3>{`${option.label}s`}</h3>
          <br />
          <Paper className='dataTablePaper'>
            <Table className='dataTable' size='medium'>
              {this.renderDataTableHeader(state, option)}
              {this.renderDataTableBody(state, option)}
            </Table>
          </Paper>
        </div>
      );
    });
  }

  renderHomeView(state) {
    return (
      <div className='dashboardBodyContainer'>
        {this.renderBodyDataTable(state)}
      </div>
    );
  }

  renderCreateFormDomainDropdown(state) {
    return (
      <FormControl variant='outlined' className='createFormControl'>
        <label className='createFormLabel'>Domain</label>
        <Select
          value={state.createForm.domain}
          onChange={event =>
            this.handleCreateFormUpdate({
              event,
              resourceValues: false,
              key: 'domain',
              domain: null,
              reset: false,
            })
          }
          input={
            <OutlinedInput labelWidth={0} name='age' id='outlined-age-simple' />
          }
        >
          {state.searchOptions.map((option, index) => (
            <MenuItem key={index} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  renderCreateFormSubmit(className, onClick) {
    return (
      <a href='#submit' onClick={onClick} className={className}>
        Submit
      </a>
    );
  }

  handleCreateFormUpdate({ event, key, resourceValues, domain, reset }) {
    if (reset) {
      return this.setState({
        createForm: {
          domain,
          formResourceValues: {
            Subject: {
              label: '',
            },
            Topic: {
              subject: 'Math',
              label: '',
            },
            Question: {
              subject: 'Math',
              topic: 'Algebra',
              content: '',
              firstAnswer: '',
              secondAnswer: '',
              thirdAnswer: '',
              fourthAnswer: '',
            },
          },
        },
      });
    }
    let newCreateForm = {};
    if (resourceValues) {
      newCreateForm = {
        ...this.state.createForm,
        formResourceValues: {
          ...this.state.createForm.formResourceValues,
          [domain]: {
            ...this.state.createForm.formResourceValues[domain],
            [key]: event.target.value,
          },
        },
      };
      return this.setState(
        {
          createForm: newCreateForm,
        },
        () => console.log('this.state.createForm', this.state.createForm),
      );
    }
    newCreateForm = {
      ...this.state.createForm,
      [key]: event.target.value,
    };
    this.setState(
      {
        createForm: newCreateForm,
      },
      () => console.log('this.state.createForm', this.state.createForm),
    );
  }

  getCurrentResources(state, resourceType) {
    let resources = [];
    state.networkQueryResults.map(result => {
      if (result.type === resourceType) {
        resources.push(bufferStringDecoder(result.label));
      }
    });
    return resources;
  }

  renderCreateFormSubjectItems(state) {
    return (
      <div className='subjectItemsContainer'>
        <div className='currentSubjectsContainer'>
          <p>
            Current Subjects:{' '}
            {this.getCurrentResources(state, 'Subject').join(', ')}
          </p>
        </div>
        <FormControl className='createFormTextFieldControl'>
          <label className='createFormLabel'>New Subject</label>
          <TextField
            placeholder='Mathematics'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Subject'].label}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'label',
                domain: 'Subject',
                reset: false,
              })
            }
            margin='normal'
          />
          {this.renderCreateFormSubmit('createFormSubmitButton', () =>
            this.createNewResource('Subject', state),
          )}
          {this.renderEventMessage(state)}
        </FormControl>
      </div>
    );
  }

  renderCreateFormResourceDropdown(state, currentResource, createFormUpdates) {
    let items = () => {
      return this.getCurrentResources(state, currentResource).map(
        (subject, index) => (
          <MenuItem key={index} value={subject}>
            {subject}
          </MenuItem>
        ),
      );
    };
    if (createFormUpdates.filter) {
      this.getCurrentResources(state, currentResource)
        .filter(createFormUpdates.filter)
        .map((subject, index) => (
          <MenuItem key={index} value={subject}>
            {subject}
          </MenuItem>
        ));
    }
    return (
      <FormControl variant='outlined' className='createFormControl'>
        <label className='createFormLabel'>{`${currentResource}s`}</label>
        <Select
          value={createFormUpdates.selectValue}
          onChange={event =>
            this.handleCreateFormUpdate({
              event,
              resourceValues: true,
              key: createFormUpdates.key,
              domain: createFormUpdates.domain,
              reset: false,
            })
          }
          input={
            <OutlinedInput labelWidth={0} name='age' id='outlined-age-simple' />
          }
        >
          {items()}
        </Select>
      </FormControl>
    );
  }

  renderCreateFormTopicItems(state) {
    return (
      <div className='topicItemsContainer'>
        {this.renderCreateFormResourceDropdown(state, 'Subject', {
          selectValue: state.createForm.formResourceValues['Topic'].subject,
          key: 'subject',
          domain: 'Topic',
          filter: null,
        })}
        <div className='currentSubjectsContainer'>
          <p>
            Current Topics:{' '}
            {this.getCurrentResources(state, 'Topic').join(', ')}
          </p>
        </div>
        <FormControl className='createFormTextFieldControl'>
          <label className='createFormLabel'>New Topic</label>
          <TextField
            placeholder='Mathematics'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Topic'].label}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'label',
                domain: 'Topic',
                reset: false,
              })
            }
            margin='normal'
          />
          {this.renderCreateFormSubmit('createFormSubmitButton', () =>
            this.createNewResource('Topic', state),
          )}
          {this.renderEventMessage(state)}
        </FormControl>
      </div>
    );
  }

  renderCreateFormQuestionItems(state) {
    return (
      <div className='topicItemsContainer'>
        {this.renderCreateFormResourceDropdown(state, 'Subject', {
          selectValue: state.createForm.formResourceValues['Question'].subject,
          key: 'subject',
          domain: 'Question',
          filter: null,
        })}
        {this.renderCreateFormResourceDropdown(state, 'Topic', {
          selectValue: state.createForm.formResourceValues['Question'].topic,
          key: 'topic',
          domain: 'Question',
          filter: resource => resource, // CHANGE: Handle only showing options for current subject
        })}
        <br />
        <br />
        <br />
        <FormControl className='createFormTextFieldControl'>
          <label className='createFormLabel'>Question</label>
          <TextField
            multiline
            rows='4'
            placeholder='What is...'
            className='createFormTextField'
            margin='normal'
            value={state.createForm.formResourceValues['Question'].content}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'content',
                domain: 'Question',
                reset: false,
              })
            }
          />
          <br />
          <br />
          <br />
          <label className='createFormLabel'>Give 4 possible answers</label>
          <TextField
            placeholder='A...'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Question'].firstAnswer}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'firstAnswer',
                domain: 'Question',
                reset: false,
              })
            }
            margin='normal'
          />
          <TextField
            placeholder='B...'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Question'].secondAnswer}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'secondAnswer',
                domain: 'Question',
                reset: false,
              })
            }
            margin='normal'
          />
          <TextField
            placeholder='C...'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Question'].thirdAnswer}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'thirdAnswer',
                domain: 'Question',
                reset: false,
              })
            }
            margin='normal'
          />
          <TextField
            placeholder='D...'
            className='createFormTextField'
            value={state.createForm.formResourceValues['Question'].fourthAnswer}
            onChange={event =>
              this.handleCreateFormUpdate({
                event,
                resourceValues: true,
                key: 'fourthAnswer',
                domain: 'Question',
                reset: false,
              })
            }
            margin='normal'
          />
          {this.renderCreateFormSubmit('createFormSubmitButton', () =>
            this.createNewResource('Question', state),
          )}
          {this.renderEventMessage(state)}
        </FormControl>
      </div>
    );
  }

  renderEventMessage(state) {
    return (
      <div className='eventMessageContainer'>
        <p className='successMessage'>{state.success}</p>
        <p className='errorMessage'>{state.error}</p>
      </div>
    );
  }

  renderCreateFormDomainChildren(state) {
    switch (state.createForm.domain) {
      case 'Subject':
        return this.renderCreateFormSubjectItems(state);
      case 'Topic':
        return this.renderCreateFormTopicItems(state);
      case 'Question':
        return this.renderCreateFormQuestionItems(state);
    }
  }

  renderCreateFormView(state) {
    return (
      <div className='createFormContainer'>
        <div className='createFormHeader'>
          <h3>Create</h3>
        </div>
        <form className='createForm' autoComplete='off'>
          {this.renderCreateFormDomainDropdown(state)}
          {this.renderCreateFormDomainChildren(state)}
        </form>
      </div>
    );
  }

  renderSearchView(state) {
    return (
      <div className='dashboardBodyContainer'>
        {this.renderSearchViewHeader(state)}
        {this.renderSearchViewResults(state)}
      </div>
    );
  }

  renderBody(state) {
    switch (state.bodyViewState.active) {
      case 'Home':
        return this.renderHomeView(state);
      case 'CreateForm':
        return this.renderCreateFormView(state);
      case 'Search':
        return this.renderSearchView(state);
    }
  }

  renderFooter() {
    return (
      <div className='dashboardFooter'>
        <p>Mizu Development LLC</p>
      </div>
    );
  }

  render() {
    return (
      <div className='dashboardContainer'>
        {this.renderHeader()}
        {this.renderRightMenu(this.state)}
        {this.renderBody(this.state)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  question: state.question,
  model: state.model,
});

// const mapDispatchToProps = (dispath) => ();

export default connect(
  mapStateToProps,
  null,
)(Dashboard);
