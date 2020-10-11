import React from "react";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import SchedulePhrase from "@/components/queries/SchedulePhrase";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Layout from "@/components/layouts/ContentWithSidebar";

import Search from "@/services/search";
import { currentUser } from "@/services/auth";
import location from "@/services/location";

import QueriesListEmptyState from "@/pages/queries-list/QueriesListEmptyState";

import "@/pages/queries-list/queries-list.css";

class QueriesList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  sidebarMenu = [
    {
      key: "favorites",
      href: "queries/new",
      title: "Create query from this search",
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />,
    }
  ];

  listColumns = [
    Columns.custom((text, item) => item.author, { title: "Author" }),
    Columns.custom((text, item) => item.title, { title: "Title" }),
  ];

  componentDidMount() {
    this.unlistenLocationChanges = location.listen((unused, action) => {
      const searchTerm = location.search.q || "";
      if (action === "PUSH" && searchTerm !== this.props.controller.searchTerm) {
        this.props.controller.updateSearch(searchTerm);
      }
    });
  }

  componentWillUnmount() {
    if (this.unlistenLocationChanges) {
      this.unlistenLocationChanges();
      this.unlistenLocationChanges = null;
    }
  }

  render() {
    const { controller } = this.props;
    return (
      <div className="page-queries-list">
        <div className="container">
          <PageHeader title={controller.params.pageTitle} />
          <Layout className="m-l-15 m-r-15">
            <Layout.Sidebar className="m-b-0">
              {controller.isLoaded && !controller.isEmpty && controller.searchTerm && (
                <Sidebar.Menu items={this.sidebarMenu} />
              )}
            </Layout.Sidebar>
            <Layout.Content>
              <Sidebar.SearchInput
                placeholder="Search..."
                value={controller.searchTerm}
                onChange={controller.updateSearch}
              />
              {!controller.isLoaded && <LoadingState />}
              {controller.isLoaded && controller.isEmpty && (
                <QueriesListEmptyState
                  page={controller.params.currentPage}
                  searchTerm={controller.searchTerm}
                  selectedTags={controller.selectedTags}
                />
              )}
              {controller.isLoaded && !controller.isEmpty && controller.searchTerm && (
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    items={controller.pageItems}
                    columns={this.listColumns}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    totalCount={controller.totalItemsCount}
                    itemsPerPage={controller.itemsPerPage}
                    page={controller.page}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              )}
            </Layout.Content>
          </Layout>
        </div>
      </div>
    );
  }
}

const QueriesListPage = itemsList(
  QueriesList,
  () =>
    new ResourceItemsSource({
      getResource({}) {
        return Search.query.bind(Search);
      }
    }),
  () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
);

export default routeWithUserSession({
  path: "/search",
  title: "Search",
  render: pageProps => <QueriesListPage {...pageProps} />,
});
